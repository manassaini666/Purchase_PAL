import { z } from "zod";

/**
 * PayPal Sandbox client (Orders v2). SANDBOX ONLY.
 *
 * Confirmed in PayPal docs: POST /v2/checkout/orders (intent CAPTURE,
 *   payment_source.paypal.experience_context, payer-action link),
 *   POST /v2/checkout/orders/{id}/capture with body {},
 *   GET /v2/checkout/orders/{id}, PayPal-Request-Id header on create.
 * UNVERIFIED (to be proven by scripts/spike.mjs):
 *   POST /v1/oauth2/token (Basic auth + grant_type=client_credentials),
 *   PayPal-Request-Id on capture, capture response field names.
 */

export class PayPalError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "PayPalError";
    this.status = status;
    this.body = body;
  }
}

type Config = { clientId: string; clientSecret: string; baseUrl: string };

function getConfig(): Config {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const rawBase = process.env.PAYPAL_BASE_URL;
  if (!clientId || !clientSecret || !rawBase) {
    throw new Error(
      "Missing env vars: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET and PAYPAL_BASE_URL must be set in .env.local"
    );
  }
  const url = new URL(rawBase);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".sandbox.paypal.com")) {
    throw new Error(
      `Refusing to run: PAYPAL_BASE_URL must be a PayPal sandbox host (got "${url.hostname}"). Sandbox only.`
    );
  }
  return { clientId, clientSecret, baseUrl: url.origin };
}

// ---------- Money (integer minor units only) ----------

/** 500 -> "5.00". Spike supports USD only (2 decimal places). */
export function minorToDecimalString(minor: number, currency: string): string {
  if (!Number.isInteger(minor) || minor <= 0) {
    throw new Error("Amount must be a positive integer in minor units (e.g. 500 = 5.00 USD)");
  }
  if (currency !== "USD") {
    throw new Error("Spike supports USD only");
  }
  const whole = Math.floor(minor / 100);
  const cents = minor % 100;
  return `${whole}.${String(cents).padStart(2, "0")}`;
}

// ---------- Response validation (Zod) ----------

type Parser<T> = {
  safeParse(
    data: unknown
  ): { success: true; data: T } | { success: false; error: { message: string } };
};

async function parseResponse<T>(res: Response, what: string, schema: Parser<T>): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new PayPalError(`${what} failed with HTTP ${res.status}`, res.status, text);
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new PayPalError(`${what}: response was not valid JSON`, res.status, text);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new PayPalError(
      `${what}: unexpected response shape (${parsed.error.message})`,
      res.status,
      text
    );
  }
  return parsed.data;
}

const TokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
});

const LinkSchema = z.object({
  href: z.string(),
  rel: z.string(),
  method: z.string().optional(),
});

const OrderSchema = z.object({
  id: z.string(),
  status: z.string(),
  links: z.array(LinkSchema).default([]),
});

const CaptureResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  purchase_units: z
    .array(
      z.object({
        payments: z
          .object({
            captures: z
              .array(
                z.object({
                  id: z.string(),
                  status: z.string(),
                  amount: z
                    .object({ currency_code: z.string(), value: z.string() })
                    .optional(),
                })
              )
              .optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

const OrderIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/, "Invalid PayPal order id");

// ---------- 1. Access token (UNVERIFIED endpoint) ----------

let cached: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt) return cached.token;

  const { clientId, clientSecret, baseUrl } = getConfig();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(15000),
  });

  const data = await parseResponse(res, "Get access token", TokenSchema);
  const ttlMs = (data.expires_in ?? 300) * 1000;
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(ttlMs - 60_000, 0),
  };
  return data.access_token;
}

// ---------- 2. Create order ----------

const CreateOrderInputSchema = z.object({
  amountMinor: z.number().int().positive(),
  currency: z.literal("USD"),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
  requestId: z.string().min(8),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

export async function createOrder(input: CreateOrderInput) {
  const v = CreateOrderInputSchema.parse(input);
  const { baseUrl } = getConfig();
  const token = await getAccessToken();

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: v.currency,
          value: minorToDecimalString(v.amountMinor, v.currency),
        },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          return_url: v.returnUrl,
          cancel_url: v.cancelUrl,
        },
      },
    },
  };

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": v.requestId, // idempotency key
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  const order = await parseResponse(res, "Create order", OrderSchema);
  const approval = order.links.find((l) => l.rel === "payer-action");
  if (!approval) {
    throw new Error(
      `Create order: no "payer-action" link in response. Link rels received: ${order.links
        .map((l) => l.rel)
        .join(", ")}`
    );
  }
  return { id: order.id, status: order.status, approvalUrl: approval.href };
}

// ---------- 3. Get order status ----------

export async function getOrder(orderId: string) {
  const id = OrderIdSchema.parse(orderId);
  const { baseUrl } = getConfig();
  const token = await getAccessToken();

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });

  const order = await parseResponse(res, "Get order", OrderSchema);
  return { id: order.id, status: order.status };
}

// ---------- 4. Capture order ----------

export async function captureOrder(orderId: string, requestId: string) {
  const id = OrderIdSchema.parse(orderId);
  if (requestId.length < 8) throw new Error("requestId must be at least 8 characters");
  const { baseUrl } = getConfig();
  const token = await getAccessToken();

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(id)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": requestId, // UNVERIFIED on capture; harmless if ignored
    },
    body: "{}",
    signal: AbortSignal.timeout(15000),
  });

  const data = await parseResponse(res, "Capture order", CaptureResponseSchema);
  const captures = (data.purchase_units ?? []).flatMap((u) => u.payments?.captures ?? []);
  return { id: data.id, status: data.status, captures };
}