// src/lib/kql_parser_wasm_loader.ts

import { QueryNode } from './kql_ast';
import {
    transformRustAstToQueryNode,
    ActualRustKqlQuery, // Import the new top-level Actual Rust AST type
    ActualRustKqlStatement,
    ActualRustKqlTabularOperator,
    ActualRustKqlExpression,
    ActualRustKqlLiteralValue,
    ActualRustKqlNamedExpression,
    ActualRustKqlSortClause,
    ActualRustKqlBinaryOperator,
    ActualRustKqlFunctionName,
    ActualRustKqlPathAccessor,
    ActualRustKqlSource
} from './kql_ast_transformer';

// Simulates calling the Wasm module's exported function.
// It now directly constructs objects matching ActualRustKql... interfaces and then stringifies them.
async function simulatedWasmCall(kqlQuery: string): Promise<string> {
    const normalizedQuery = kqlQuery.trim().replace(/\s+/g, ' ').toLowerCase();
    let rustAstObject: ActualRustKqlQuery | null = null;

    // Helper to create Literal expressions matching ActualRustKqlLiteralValue variants
    const RLiteral = (value: string | number | boolean | null): { Literal: ActualRustKqlLiteralValue } => {
        if (typeof value === 'string') {
            // Crude check for ISO date string to map to Datetime, otherwise String
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return { Literal: { Datetime: value } };
            return { Literal: { String: value } };
        }
        if (typeof value === 'number') {
            // In KQL, 'long' and 'real' are distinct. We'll use Long for integers, Real for floats if needed.
            // For simplicity, mock KQL often uses numbers that could be Long.
            return { Literal: { Long: value } };
        }
        if (typeof value === 'boolean') return { Literal: { Boolean: value } };
        if (value === null) return { Literal: { Null: null } };
        throw new Error(`Unsupported literal type for mock: ${value}`);
    };
    const RCol = (name: string): { Column: { name: { value: string } } } => ({ Column: { name: { value: name } } });

    // Path helper: e.g., parsed_fields.WorkstationName
    // ActualRustKqlPath: { expression: {Column: {name: "parsed_fields"}}, accessors: [{Member: {name: "WorkstationName"}}]}
    const RPath = (objectName: string, memberName: string): { Path: { expression: ActualRustKqlExpression, accessors: ActualRustKqlPathAccessor[] } } => ({
        Path: {
            expression: RCol(objectName),
            accessors: [{ Member: { name: { value: memberName } } }]
        }
    });

    // Helper for NamedExpression
    const RNamedExpr = (alias: string, expression: ActualRustKqlExpression): ActualRustKqlNamedExpression => ({
        alias: { name: { value: alias } },
        expression
    });
    const RNamedCol = (name: string): ActualRustKqlNamedExpression => ({ // For project col1 (becomes col1=col1)
        alias: { name: { value: name } }, // In irtimmer/rust-kql, if no alias, alias is same as column name string.
                                        // Or alias can be null if it's just `expression`
        expression: RCol(name)
    });


    // --- Define ActualRustKql ASTs for supported queries ---
    let mainTabularExpression: { source: ActualRustKqlSource; operations: ActualRustKqlTabularOperator[] } | null = null;

    if (normalizedQuery === 'events | take 10') {
        mainTabularExpression = {
            source: { name: { value: 'events' }, alias: null },
            operations: [ { Take: { count: RLiteral(10) } } ],
        };
    } else if (normalizedQuery === 'events | where event_type_id == "4624" | project timestamp, user_id, ip_address | take 5') {
        mainTabularExpression = {
            source: { name: { value: 'events' }, alias: null },
            operations: [
                { Where: { predicate: { BinaryExpression: { left: RCol('event_type_id'), op: 'Equal', right: RLiteral('4624') } } } },
                { Project: { columns: [ RNamedCol('timestamp'), RNamedCol('user_id'), RNamedCol('ip_address') ]}},
                { Take: { count: RLiteral(5) } },
            ],
        };
    } else if (normalizedQuery === 'events | where event_type_id == "4625" | summarize attempts = count() by user_id | sort by attempts desc | take 10') {
        mainTabularExpression = {
            source: { name: { value: 'events' }, alias: null },
            operations: [
                { Where: { predicate: { BinaryExpression: { left: RCol('event_type_id'), op: 'Equal', right: RLiteral('4625') } } } },
                { Summarize: {
                    aggregations: [ RNamedExpr('attempts', { FunctionCall: { name: 'count', args: [] } }) ],
                    by_clauses: [ RNamedExpr('user_id', RCol('user_id')) ], // `by user_id` is `by user_id = user_id`
                }},
                { SortBy: { clauses: [ // Note: SortBy is the op name from irtimmer/rust-kql
                    { expression: RCol('attempts'), order: 'Desc' } as ActualRustKqlSortClause
                ]}},
                { Take: { count: RLiteral(10) } },
            ],
        };
    } else if (normalizedQuery === "events | summarize count_ = count() by timestamp_hour = date_trunc('hour', timestamp), event_source_name | sort by timestamp_hour asc") {
        const dateTruncNamedExpr: ActualRustKqlNamedExpression = RNamedExpr('timestamp_hour', {
            FunctionCall: {
                name: 'date_trunc',
                args: [ RLiteral('hour'), RCol('timestamp') ]
            }
        });
        mainTabularExpression = {
            source: { name: { value: 'events' }, alias: null },
            operations: [
                { Summarize: {
                    aggregations: [ RNamedExpr('count_', { FunctionCall: { name: 'count', args: [] } }) ],
                    by_clauses: [
                        dateTruncNamedExpr,
                        RNamedExpr('event_source_name', RCol('event_source_name')),
                    ],
                }},
                { SortBy: { clauses: [
                    { expression: RCol('timestamp_hour'), order: 'Asc' } as ActualRustKqlSortClause
                ]}},
            ],
        };
    } else if (normalizedQuery === 'events | where parsed_fields.logontype == 2 | project timestamp, user_id, parsed_fields.workstationname') {
        mainTabularExpression = {
            source: { name: { value: 'events' }, alias: null },
            operations: [
                { Where: { predicate: { BinaryExpression: {
                    left: RPath('parsed_fields', 'LogonType'),
                    op: 'Equal',
                    right: RLiteral(2) // KQL numbers are 'long' or 'real'
                }}}},
                { Project: { columns: [
                    RNamedCol('timestamp'),
                    RNamedCol('user_id'),
                    RNamedExpr('parsed_fields.WorkstationName', RPath('parsed_fields', 'WorkstationName')),
                ]}},
            ]
        };
    } else if (normalizedQuery === 'events | where success == true') {
        mainTabularExpression = {
            source: { name: { value: 'events' }, alias: null },
            operations: [
                { Where: { predicate: { BinaryExpression: { left: RCol('success'), op: 'Equal', right: RLiteral(true) }}}}
            ]
        };
    }
    // Add other KQL to ActualRustKql AST mappings as needed...

    if (mainTabularExpression) {
        rustAstObject = {
            statements: [ { TabularExpression: mainTabularExpression } ]
        };
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async delay
        return JSON.stringify(rustAstObject);
    } else {
        await new Promise(resolve => setTimeout(resolve, 5));
        const errorPayload = { error: "KQL Parsing Error (Simulated Wasm)", details: `Unsupported KQL query in Wasm simulation: ${kqlQuery}` };
        return Promise.reject(new Error(JSON.stringify(errorPayload)));
    }
}

export async function parseKqlToAst(kqlQuery: string): Promise<QueryNode | null> {
  try {
    console.log(`[WasmLoader] Received KQL: ${kqlQuery}`);
    const rustAstJsonString = await simulatedWasmCall(kqlQuery);
    // console.log(`[WasmLoader] Received (simulated) Actual Rust AST JSON string: ${rustAstJsonString}`); // Verbose

    const rustAstParsed = JSON.parse(rustAstJsonString); // This is now the ActualRustKqlQuery object
    // console.log(`[WasmLoader] Parsed (simulated) Actual Rust AST object:`, JSON.stringify(rustAstParsed, null, 2)); // Verbose

    const queryNode = transformRustAstToQueryNode(rustAstParsed); // Pass the parsed object
    if (!queryNode) {
      console.error(`[WasmLoader] Failed to transform Actual Rust AST for query: ${kqlQuery}. Input Rust AST:`, JSON.stringify(rustAstParsed, null, 2));
      return null;
    }

    // console.log(`[WasmLoader] Transformed to QueryNode AST:`, JSON.stringify(queryNode, null, 2)); // Verbose
    return queryNode;

  } catch (error: any) {
    let errorMessage = error.message;
    try {
        const parsedError = JSON.parse(error.message);
        errorMessage = `Error from Wasm sim: ${parsedError.error} - ${parsedError.details}`;
        console.error(`[WasmLoader] Parsed error details from Wasm sim:`, parsedError);
    } catch (e) {
        // Not a JSON error message from reject, or error is from transform/JSON.parse itself
    }
    console.error(`[WasmLoader] Error during KQL processing pipeline: ${errorMessage}`, error.stack ? `\nStack: ${error.stack}` : '');
    return null;
  }
}
