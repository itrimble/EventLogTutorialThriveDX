// src/app/api/logs/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PGUSER || 'eventlogger',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'eventlog_dev',
  password: process.env.PGPASSWORD || 'localdevpassword',
  port: parseInt(process.env.PGPORT || '5432', 10),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '500', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    // Simple query to get the most recent events
    const query = `
      SELECT 
        event_id,
        timestamp,
        event_type_id,
        event_source_name,
        severity,
        message_short,
        message_full,
        user_id,
        hostname,
        ip_address,
        parsed_fields,
        tags,
        process_name,
        process_id,
        raw_log
      FROM events
      ORDER BY timestamp DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    
    // Transform the rows to match the LogEntry type expected by the frontend
    const logEntries = result.rows.map(row => ({
      id: row.event_id,
      timestamp: row.timestamp,
      source_identifier: row.event_source_name || 'Unknown',
      log_file: row.parsed_fields?.source_file || 'Unknown',
      message: row.message_full || row.message_short || row.raw_log || 'No message available',
      enriched_data: {
        severity: row.severity,
        hostname: row.hostname,
        ip_address: row.ip_address,
        user_id: row.user_id,
        process_name: row.process_name,
        process_id: row.process_id,
        tags: row.tags,
        parsed_fields: row.parsed_fields,
        event_type_id: row.event_type_id
      }
    }));

    return NextResponse.json(logEntries);
  } catch (error: any) {
    console.error('[API/logs] Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error.message },
      { status: 500 }
    );
  }
}