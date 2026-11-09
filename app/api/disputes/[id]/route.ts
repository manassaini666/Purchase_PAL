import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { decision } = await request.json();

    const dbPath = path.join(process.cwd(), "dev.db");
    const sqlite = new Database(dbPath);

    const newStatus = decision === "REFUND_BUYER" ? "REFUNDED" : "RELEASED";
    const verdict = decision === "REFUND_BUYER" 
      ? "AI Judge Verdict: Evidence insufficient. Escrow refunded to buyer." 
      : "AI Judge Verdict: Milestone requirements verified. Escrow released to merchant.";

    sqlite.prepare(
      "UPDATE Dispute SET status = ?, aiVerdict = ? WHERE id = ?"
    ).run(newStatus, verdict, id);

    sqlite.close();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}