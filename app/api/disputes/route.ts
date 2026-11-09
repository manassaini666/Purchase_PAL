import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), "dev.db");
    const sqlite = new Database(dbPath);
    
    // Fetch all disputes ordered by creation time
    const disputes = sqlite.prepare("SELECT * FROM Dispute ORDER BY createdAt DESC").all();
    sqlite.close();

    return NextResponse.json({ success: true, disputes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}