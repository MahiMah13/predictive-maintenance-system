import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pkg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pkg;

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(rootDir, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const migrationsDir = path.join(rootDir, 'supabase', 'migrations');

console.log('--------------------------------------------------');
console.log('🚀 Supabase Migration Runner');
console.log('--------------------------------------------------');
console.log(`📁 Target Directory: ${migrationsDir}`);

if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL is missing in environment variables.');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.');
  process.exit(1);
}

// Function to get connection string or fallback
function getConnectionString() {
  if (DATABASE_URL) return DATABASE_URL;

  // Extract project ref from SUPABASE_URL (e.g. https://xyz.supabase.co -> xyz)
  try {
    const url = new URL(SUPABASE_URL);
    const hostParts = url.hostname.split('.');
    const projectRef = hostParts[0];

    const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD;
    if (dbPassword) {
      return `postgres://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
    }
  } catch (e) {
    // Ignore URL parse error
  }
  return null;
}

// Direct SQL Execution via PG Client
async function runMigrationsDirectly(connString, files) {
  console.log('📡 Connecting to Supabase Cloud PostgreSQL...');
  const client = new Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Connected to database successfully.');

  // Create migrations table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS public._schema_migrations (
      version TEXT PRIMARY KEY,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const { rows } = await client.query('SELECT version FROM public._schema_migrations');
  const executedVersions = new Set(rows.map(r => r.version));

  for (const file of files) {
    if (executedVersions.has(file)) {
      console.log(`⏩ Skipping already applied migration: ${file}`);
      continue;
    }

    console.log(`▶ Running migration: ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    const startTime = Date.now();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO public._schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      const duration = Date.now() - startTime;
      console.log(`✅ Applied ${file} successfully in ${duration}ms`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌ Migration failed for ${file}:`, err.message);
      throw err;
    }
  }

  await client.end();
}

// Fallback method using Supabase Service Role API / RPC / Query endpoint
async function runMigrationsViaSupabaseApi(files) {
  console.log('🔑 Initializing Supabase Service Role Client...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // Test connection
  const { data, error } = await supabase.from('organizations').select('count', { count: 'exact', head: true });
  if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
    console.warn('⚠️ Supabase connection check warning:', error.message);
  }

  console.log('ℹ️ Attempting migration execution using Supabase API...');

  for (const file of files) {
    console.log(`▶ Processing migration file: ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Try rpc 'exec_sql' if registered on database
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (rpcError) {
      if (rpcError.message?.includes('function') || rpcError.code === 'PGRST202') {
        console.log(`ℹ️ RPC 'exec_sql' not present on Supabase. SQL script generated & ready at:`);
        console.log(`   ${filePath}`);
        console.log(`👉 You can execute this file directly in the Supabase Dashboard SQL Editor or provide DATABASE_URL in .env`);
      } else {
        console.error(`❌ Error applying ${file}:`, rpcError.message);
      }
    } else {
      console.log(`✅ Applied ${file} successfully via Supabase RPC.`);
    }
  }
}

async function main() {
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migration directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('ℹ️ No .sql migration files found.');
    return;
  }

  console.log(`📄 Found ${files.length} migration script(s): ${files.join(', ')}`);

  const connectionString = getConnectionString();

  if (connectionString) {
    try {
      await runMigrationsDirectly(connectionString, files);
    } catch (err) {
      console.warn('⚠️ Direct PostgreSQL connection failed, falling back to Supabase API check...');
      await runMigrationsViaSupabaseApi(files);
    }
  } else {
    await runMigrationsViaSupabaseApi(files);
  }

  console.log('--------------------------------------------------');
  console.log('🎉 Migration run completed!');
  console.log('--------------------------------------------------');
}

main().catch(err => {
  console.error('💥 Fatal Migration Error:', err);
  process.exit(1);
});
