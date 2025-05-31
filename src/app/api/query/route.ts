// src/app/api/query/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { parseKqlToAst } from '@/lib/kql_parser_real';
import { transpileAstToSql } from '@/lib/kql_to_sql';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'eventlog_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function POST(request: Request) {
  const body = await request.json();
  const kqlQuery: string = body.query;

  if (!kqlQuery || typeof kqlQuery !== 'string') {
    return NextResponse.json({ error: 'Invalid query provided. Expecting a JSON object with a "query" field of type string.' }, { status: 400 });
  }

  console.log(`[KQL_API] Received KQL Query: ${kqlQuery}`);

  let ast;
  try {
    ast = await parseKqlToAst(kqlQuery);
    if (!ast) {
      // This case might be hit if parseKqlToAst returns null for non-fatal "query not supported"
      console.warn(`[KQL_API] KQL parsing resulted in null AST for query: ${kqlQuery}. Assuming query not supported.`);
      return NextResponse.json({ error: 'KQL Parsing Error', details: "Unsupported KQL syntax or query structure." }, { status: 400 });
    }
    console.log(`[KQL_API] Generated AST: ${JSON.stringify(ast, null, 2)}`);
  } catch (parseError: any) {
    // This case for if parseKqlToAst itself throws an error (e.g. simulated Wasm error)
    console.error(`[KQL_API] KQL Parsing Exception: ${parseError.message}`, parseError.stack);
    return NextResponse.json({ error: 'KQL Parsing Error', details: parseError.message || "Fatal error during KQL parsing." }, { status: 400 });
  }

  let sqlQuery;
  try {
    sqlQuery = transpileAstToSql(ast);
    console.log(`[KQL_API] Generated SQL: ${sqlQuery}`);
  } catch (transpileError: any) {
    console.error(`[KQL_API] KQL Transpiling Error: ${transpileError.message}`, transpileError.stack);
    return NextResponse.json({ error: 'KQL Transpiling Error', details: transpileError.message || "Could not convert KQL AST to SQL." }, { status: 500 });
  }

  // Basic validation to prevent accidental execution of non-SELECT queries from this PoC transpiler
  if (!sqlQuery.trim().toUpperCase().startsWith('SELECT')) {
      console.error(`[KQL_API] Generated SQL is not a SELECT query: ${sqlQuery}`);
      return NextResponse.json({ error: 'Generated SQL query is not a SELECT statement. Execution aborted for safety.' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query(sqlQuery);
    return NextResponse.json({ data: rows, query: kqlQuery, sql: sqlQuery });
  } catch (dbError: any) {
    console.error(`[KQL_API] Database Query Error: Code: ${dbError.code}, Message: ${dbError.message}`, dbError.stack);
    // Avoid sending raw dbError.message to client if it's too revealing of schema etc.
    let clientErrorDetails = "Error executing query against the database.";
    if (process.env.NODE_ENV === 'development') { // Provide more details in dev
        clientErrorDetails = `DB Error Code ${dbError.code}: ${dbError.message}`;
    }
    return NextResponse.json({ error: 'Database Query Error', details: clientErrorDetails }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function GET() {
  return NextResponse.json({ message: 'KQL query endpoint. Use POST with a JSON body: { "query": "your_kql_query" }' });
}
