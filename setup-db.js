import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/purchase_pal?schema=public',
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL database!');

  await client.query(`
    CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');
    CREATE TYPE "TransactionStatus" AS ENUM ('APPROVED', 'BLOCKED', 'PENDING_APPROVAL');

    CREATE TABLE IF NOT EXISTS "users" (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "agents" (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "users"(id),
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "policies" (
      policy_id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES "agents"(id),
      status "PolicyStatus" DEFAULT 'ACTIVE',
      raw_prompt TEXT NOT NULL,
      mandate_json JSONB NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "transaction_logs" (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES "agents"(id),
      policy_id TEXT NOT NULL REFERENCES "policies"(policy_id),
      merchant TEXT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      currency TEXT DEFAULT 'USD',
      category TEXT NOT NULL,
      status "TransactionStatus" NOT NULL,
      block_reason TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tables successfully created!');
  await client.end();
}

main().catch((err) => {
  console.error('Error setting up database:', err);
  process.exit(1);
});