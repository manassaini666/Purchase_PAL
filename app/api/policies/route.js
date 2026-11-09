import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

// Helper to get DB connection
function getDb() {
  const dbPath = path.join(process.cwd(), "dev.db");
  const db = new Database(dbPath);
  
  // Ensure Policy table uses userId as primary/unique key
  db.exec(`
    CREATE TABLE IF NOT EXISTS PolicyConfig (
      userId TEXT PRIMARY KEY,
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

  return db;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || "default-user";

    const db = getDb();
    let policy = db.prepare("SELECT * FROM PolicyConfig WHERE userId = ?").get(userId);

    // Agar is user ke liye pehle se policy nahi hai, toh default values insert kar do
    if (!policy) {
      db.prepare(`
        INSERT INTO PolicyConfig (userId, maxSpendPerTx, manualApprovalAbove, dailyBudget, monthlyBudget, allowedMerchants, blockedCategories, allowedStartTime, allowedEndTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, 63, -13, 150, 300, "Merchant A, Merchant B", "Gift Cards, Crypto", "08:00", "22:00");

      policy = db.prepare("SELECT * FROM PolicyConfig WHERE userId = ?").get(userId);
    }

    db.close();
    return NextResponse.json({ success: true, policy });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ...fields } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const db = getDb();

    // Get current policy for this specific user
    let current = db.prepare("SELECT * FROM PolicyConfig WHERE userId = ?").get(userId);

    if (!current) {
      // Insert if not exists
      db.prepare(`
        INSERT INTO PolicyConfig (userId, maxSpendPerTx, manualApprovalAbove, dailyBudget, monthlyBudget, allowedMerchants, blockedCategories, allowedStartTime, allowedEndTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        fields.maxSpendPerTx ?? 63,
        fields.manualApprovalAbove ?? -13,
        fields.dailyBudget ?? 150,
        fields.monthlyBudget ?? 300,
        fields.allowedMerchants ?? "Merchant A, Merchant B",
        fields.blockedCategories ?? "Gift Cards, Crypto",
        fields.allowedStartTime ?? "08:00",
        fields.allowedEndTime ?? "22:00"
      );
    } else {
      // Update specific fields for this user
      const maxSpendPerTx = fields.maxSpendPerTx !== undefined ? fields.maxSpendPerTx : current.maxSpendPerTx;
      const manualApprovalAbove = fields.manualApprovalAbove !== undefined ? fields.manualApprovalAbove : current.manualApprovalAbove;
      const dailyBudget = fields.dailyBudget !== undefined ? fields.dailyBudget : current.dailyBudget;
      const monthlyBudget = fields.monthlyBudget !== undefined ? fields.monthlyBudget : current.monthlyBudget;
      const allowedMerchants = fields.allowedMerchants !== undefined ? fields.allowedMerchants : current.allowedMerchants;
      const blockedCategories = fields.blockedCategories !== undefined ? fields.blockedCategories : current.blockedCategories;
      const allowedStartTime = fields.allowedStartTime !== undefined ? fields.allowedStartTime : current.allowedStartTime;
      const allowedEndTime = fields.allowedEndTime !== undefined ? fields.allowedEndTime : current.allowedEndTime;

      db.prepare(`
        UPDATE PolicyConfig 
        SET maxSpendPerTx = ?, manualApprovalAbove = ?, dailyBudget = ?, monthlyBudget = ?, allowedMerchants = ?, blockedCategories = ?, allowedStartTime = ?, allowedEndTime = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE userId = ?
      `).run(maxSpendPerTx, manualApprovalAbove, dailyBudget, monthlyBudget, allowedMerchants, blockedCategories, allowedStartTime, allowedEndTime, userId);
    }

    db.close();
    return NextResponse.json({ success: true, message: "User-specific policy auto-synced!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}