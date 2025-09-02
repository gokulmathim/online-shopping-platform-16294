'use strict';
/**
 * Database configuration and connection pool for PostgreSQL using pg.
 * Reads configuration from environment variables. Do not hardcode credentials.
 */
const { Pool } = require('pg');

// Create a connection pool using environment variables.
// Required env vars are documented in .env.example at the repo root.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional granular settings (used when DATABASE_URL not provided)
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : process.env.PGSSL ? true : undefined,
  max: process.env.PGPOOL_MAX ? Number(process.env.PGPOOL_MAX) : 10,
  idleTimeoutMillis: 30000,
});

/**
 * Executes a SQL query using the pool.
 * PUBLIC_INTERFACE
 * @param {string} text - SQL text
 * @param {Array} params - parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};
