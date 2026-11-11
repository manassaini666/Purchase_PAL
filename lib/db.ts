import Database from "better-sqlite3";
import path from "path";

// Shared SQLite database instance for all API routes
const dbPath = path.join(process.cwd(), "dev.db");
export const db = new Database(dbPath);