// src/lib/kql_parser_wasm_loader.ts

import { QueryNode } from './kql_ast';
import { transformRustAstToQueryNode } from './kql_ast_transformer';
import {
    RUST_AST_TAKE_10,
    RUST_AST_WHERE_PROJECT,
    RUST_AST_SUMMARIZE_COUNT,
    RUST_AST_WHERE_PARSED_FIELDS_NUMERIC,
    RUST_AST_WHERE_BOOLEAN,
    RUST_AST_TOP_FAILED_LOGINS,
    RUST_AST_AUTH_ATTEMPTS_TIME
} from './kql_rust_ast_samples';

// This mapping simulates which KQL query maps to which hardcoded Rust AST JSON sample.
const kqlToRustAstSampleMap: Record<string, string | undefined> = {
    'events | take 10': RUST_AST_TAKE_10,
    'events | where event_type_id == "4624" | project timestamp, user_id': RUST_AST_WHERE_PROJECT, // Adjusted to match sample
    'events | summarize event_count = count() by event_type_id': RUST_AST_SUMMARIZE_COUNT,
    'events | where parsed_fields.logontype == 2': RUST_AST_WHERE_PARSED_FIELDS_NUMERIC, // KQL for parsed_fields.LogonType == 2
    'events | where success == true': RUST_AST_WHERE_BOOLEAN,
    // Queries from AuthenticationDashboard integrations
    'events | where event_type_id == "4625" | summarize attempts = count() by user_id | sort by attempts desc | take 10': RUST_AST_TOP_FAILED_LOGINS,
    "events | summarize count_ = count() by timestamp_hour = date_trunc('hour', timestamp), event_source_name | sort by timestamp_hour asc": RUST_AST_AUTH_ATTEMPTS_TIME,

    // Additional test cases from kql_parser_real.ts (for which samples might not be defined above, but can be added)
    // For example, the complex where: 'events | where severity == "high" and (process_name contains "cmd" or process_name contains "powershell")'
    // would need its own RUST_AST_... sample and mapping if we want to test it through this loader.
    // For now, unmapped queries will result in a simulated parse error.
};


// Simulates calling the Wasm module's exported function.
// In reality, this would involve `await import('path/to/wasm_pkg')` and then `wasm.parse_kql_to_json_ast_string(kqlQuery)`.
async function simulatedWasmCall(kqlQuery: string): Promise<string> {
    // Normalize query for matching, similar to how mock_kql_parser did
    const normalizedQuery = kqlQuery.trim().replace(/\s+/g, ' ').toLowerCase();

    const rustAstJsonString = kqlToRustAstSampleMap[normalizedQuery];

    if (rustAstJsonString) {
        // Simulate async delay of Wasm execution
        await new Promise(resolve => setTimeout(resolve, 10)); // e.g., 10ms delay
        return rustAstJsonString;
    } else {
        // Simulate a parsing error from Wasm for unsupported queries
        await new Promise(resolve => setTimeout(resolve, 5));
        // Return an error structure that the calling code might expect, or just throw.
        // The conceptual Rust code returns Result<String, JsValue>, JsValue often becomes an Error in JS.
        // So, throwing an error here is more aligned.
        const errorJson = JSON.stringify({ error: "KQL Parsing Error", details: `Unsupported KQL query in Wasm simulation: ${kqlQuery}` });
        // throw new Error(errorJson); // Option 1: Throw error
        return Promise.reject(new Error(errorJson)); // Option 2: Return a rejected promise with an Error
                                                    // This is often better as it forces .catch() usage
    }
}

export async function parseKqlToAst(kqlQuery: string): Promise<QueryNode | null> {
  try {
    console.log(`[WasmLoader] Received KQL: ${kqlQuery}`);
    const rustAstJsonString = await simulatedWasmCall(kqlQuery);
    console.log(`[WasmLoader] Received Rust AST JSON string: ${rustAstJsonString}`);

    const rustAst = JSON.parse(rustAstJsonString);
    console.log(`[WasmLoader] Parsed Rust AST object:`, rustAst);

    const queryNode = transformRustAstToQueryNode(rustAst);
    if (!queryNode) {
      console.error(`[WasmLoader] Failed to transform Rust AST for query: ${kqlQuery}`);
      // Error already logged in transformRustAstToQueryNode if it returns null
      return null;
    }

    console.log(`[WasmLoader] Transformed to QueryNode AST:`, queryNode);
    return queryNode;

  } catch (error: any) {
    console.error(`[WasmLoader] Error during KQL processing pipeline: ${error.message}`, error.stack);
    // Try to parse error if it's a JSON string from simulatedWasmCall's reject
    try {
        const parsedError = JSON.parse(error.message);
        // You could use parsedError.error and parsedError.details here
        console.error(`[WasmLoader] Parsed error details:`, parsedError);
    } catch (e) {
        // Not a JSON error message, just log the original error message
    }
    return null;
  }
}
