import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

export async function GET() {
  try {
    // Connect directly to your SQLite dev.db file
    const dbPath = path.join(process.cwd(), "dev.db");
    const sqlite = new Database(dbPath);

    // Insert a test dispute directly into the Dispute table
    const stmt = sqlite.prepare(`
      INSERT INTO Dispute (id, transactionId, merchantName, freelancerName, amount, disputeReason, status, aiVerdict, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    const testId = "cuid_" + Date.now();
    stmt.run(
      testId,
      "tx_test_001",
      "Test Merchant",
      "Manas Saini",
      45.00,
      "Testing AI Judge arbitration pipeline",
      "PENDING_ARBITRATION",
      "AI Judge analysis in progress..."
    );

    // Fetch all disputes to verify
    const allDisputes = sqlite.prepare("SELECT * FROM Dispute").all();
    sqlite.close();

    return NextResponse.json({ success: true, insertedId: testId, allDisputes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}