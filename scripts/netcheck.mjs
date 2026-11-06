import dns from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(file) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) return false;
  for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let value = t.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}

function show(e) {
  const c = e && e.cause;
  const causeText = c ? ` | cause: ${c.code ?? ""} ${c.message ?? c}` : "";
  const base = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  return base + causeText;
}

async function check(label, fn) {
  try {
    const out = await fn();
    console.log(`OK    ${label}${out ? " -> " + out : ""}`);
  } catch (e) {
    console.log(`FAIL  ${label} -> ${show(e)}`);
  }
}

loadEnvFile(".env.local");

const host = "api-m.sandbox.paypal.com";
const baseUrl = process.env.PAYPAL_BASE_URL;
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

console.log("=== Network check (no secrets are printed) ===");
console.log("Node version:", process.version);
console.log("PAYPAL_BASE_URL (exact):", JSON.stringify(baseUrl));
console.log("PAYPAL_CLIENT_ID set:", Boolean(clientId), "| PAYPAL_CLIENT_SECRET set:", Boolean(clientSecret));
for (const name of ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "NODE_OPTIONS"]) {
  console.log(`${name}:`, process.env[name] ? "SET" : "not set");
}
console.log("");

await check("DNS lookup of the PayPal sandbox host", async () => {
  const list = await dns.lookup(host, { all: true });
  return list.map((a) => a.address).join(", ");
});

await check("GET https://" + host + "/ (expect HTTP 403)", async () => {
  const r = await fetch(`https://${host}/`, { signal: AbortSignal.timeout(15000) });
  return `HTTP ${r.status}`;
});

await check("POST token with FAKE credentials (expect HTTP 401)", async () => {
  const r = await fetch(`https://${host}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from("fake:fake").toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(15000),
  });
  return `HTTP ${r.status}`;
});

if (baseUrl && clientId && clientSecret) {
  await check("POST token with YOUR credentials (expect HTTP 200)", async () => {
    const r = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(15000),
    });
    return `HTTP ${r.status}`;
  });
} else {
  console.log("SKIP  real-credentials test: .env.local is missing a value");
}