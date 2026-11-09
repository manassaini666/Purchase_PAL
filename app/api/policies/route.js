import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

// Helper to get DB connection
function getDb() {
  const dbPath = path.join(process.cwd(), "dev.db");
  const db = new Database(dbPath);
  
  // Ensure Policy table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS PolicyConfig (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      maxSpendPerTx REAL,
      manualApprovalAbove REAL,
      dailyBudget REAL,
      monthlyBudget REAL,
      allowedMerchants TEXT,
      blockedCategories TEXT,
      allowedStartTime TEXT,
      allowedEndTime TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure at least one row exists
  const row = db.prepare("SELECT * FROM PolicyConfig LIMIT 1").get();
  if (!row) {
    db.prepare(`
      INSERT INTO PolicyConfig (maxSpendPerTx, manualApprovalAbove, dailyBudget, monthlyBudget, allowedMerchants, blockedCategories, allowedStartTime, allowedEndTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(63, -13, 150, 300, "Merchant A, Merchant B", "Gift Cards, Crypto", "08:00", "22:00");
  }

  return db;
}

export async function GET() {
  try {
    const db = getDb();
    const policy = db.prepare("SELECT * FROM PolicyConfig LIMIT 1").get();
    db.close();
    return NextResponse.json({ success: true, policy });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDb();

    // Get current policy to merge updates
    const current = db.prepare("SELECT * FROM PolicyConfig LIMIT 1").get();

    const maxSpendPerTx = body.maxSpendPerTx !== undefined ? body.maxSpendPerTx : current.maxSpendPerTx;
    const manualApprovalAbove = body.manualApprovalAbove !== undefined ? body.manualApprovalAbove : current.manualApprovalAbove;
    const dailyBudget = body.dailyBudget !== undefined ? body.dailyBudget : current.dailyBudget;
    const monthlyBudget = body.monthlyBudget !== undefined ? body.monthlyBudget : current.monthlyBudget;
    const allowedMerchants = body.allowedMerchants !== undefined ? body.allowedMerchants : current.allowedMerchants;
    const blockedCategories = body.blockedCategories !== undefined ? body.blockedCategories : current.blockedCategories;
    const allowedStartTime = body.allowedStartTime !== undefined ? body.allowedStartTime : current.allowedStartTime;
    const allowedEndTime = body.allowedEndTime !== undefined ? body.allowedEndTime : current.allowedEndTime;

    db.prepare(`
      UPDATE PolicyConfig 
      SET maxSpendPerTx = ?, manualApprovalAbove = ?, dailyBudget = ?, monthlyBudget = ?, allowedMerchants = ?, blockedCategories = ?, allowedStartTime = ?, allowedEndTime = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(maxSpendPerTx, manualApprovalAbove, dailyBudget, monthlyBudget, allowedMerchants, blockedCategories, allowedStartTime, allowedEndTime);

    db.close();
    return NextResponse.json({ success: true, message: "Policy auto-synced successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}