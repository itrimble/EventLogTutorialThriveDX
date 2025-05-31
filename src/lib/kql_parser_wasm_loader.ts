// src/lib/kql_parser_wasm_loader.ts

import { QueryNode } from './kql_ast';
import {
    transformRustAstToQueryNode,
    RealisticRustKqlQuery, // Import the new top-level Rust AST type
    // Import other RealisticRustKql... types as needed for constructing the mock objects
    RealisticRustKqlExpression,
    RealisticRustKqlLiteralValue,
    RealisticRustKqlNamedExpression,
    RealisticRustKqlSortClause
} from './kql_ast_transformer';


// Simulates calling the Wasm module's exported function.
// It now directly constructs objects matching RealisticRustKql... interfaces and then stringifies them.
async function simulatedWasmCall(kqlQuery: string): Promise<string> {
    const normalizedQuery = kqlQuery.trim().replace(/\s+/g, ' ').toLowerCase();
    let rustAstObject: RealisticRustKqlQuery | null = null;

    // Helper to create Literal expressions (more verbose but matches hypothesized Rust AST)
    const RLiteral = (value: string | number | boolean | null): { Literal: RealisticRustKqlLiteralValue } => {
        if (typeof value === 'string') return { Literal: { String: value } };
        if (typeof value === 'number') return { Literal: { Number: value } };
        if (typeof value === 'boolean') return { Literal: { Boolean: value } };
        if (value === null) return { Literal: { Null: null } };
        // Add Datetime, Timespan if needed for specific queries
        throw new Error(`Unsupported literal type for mock: ${value}`);
    };
    const RCol = (name: string): { Column: { name: string } } => ({ Column: { name } });
    // Helper for parsed_fields access: e.g., parsed_fields.WorkstationName
    const RPath = (objectName: string, memberName: string): { Path: {object: RealisticRustKqlExpression, member: string} } => ({
        Path: { object: RCol(objectName), member: memberName }
    });


    // --- Define RealisticRustKql ASTs for supported queries ---

    if (normalizedQuery === 'events | take 10') {
        rustAstObject = {
            source: { name: 'events' },
            operations: [ { Take: { count: RLiteral(10) } } ],
        };
    } else if (normalizedQuery === 'events | where event_type_id == "4624" | project timestamp, user_id, ip_address | take 5') {
        rustAstObject = {
            source: { name: 'events' },
            operations: [
                { Where: { predicate: { BinaryExpression: { left: RCol('event_type_id'), operator: '==', right: RLiteral('4624') } } } },
                { Project: { columns: [
                    { alias: 'timestamp', expression: RCol('timestamp') } as RealisticRustKqlNamedExpression,
                    { alias: 'user_id', expression: RCol('user_id') } as RealisticRustKqlNamedExpression,
                    { alias: 'ip_address', expression: RCol('ip_address') } as RealisticRustKqlNamedExpression,
                ]}},
                { Take: { count: RLiteral(5) } },
            ],
        };
    } else if (normalizedQuery === 'events | where event_type_id == "4625" | summarize attempts = count() by user_id | sort by attempts desc | take 10') {
        rustAstObject = {
            source: { name: 'events' },
            operations: [
                { Where: { predicate: { BinaryExpression: { left: RCol('event_type_id'), operator: '==', right: RLiteral('4625') } } } },
                { Summarize: {
                    aggregations: [ { alias: 'attempts', expression: { FunctionCall: { function_name: 'count', arguments: [] } } } as RealisticRustKqlNamedExpression ],
                    group_by: [ RCol('user_id') ],
                }},
                { Sort: { clauses: [
                    { expression: RCol('attempts'), sort_order: 'Desc' } as RealisticRustKqlSortClause
                ]}},
                { Take: { count: RLiteral(10) } },
            ],
        };
    } else if (normalizedQuery === "events | summarize count_ = count() by timestamp_hour = date_trunc('hour', timestamp), event_source_name | sort by timestamp_hour asc") {
        // How irtimmer/rust-kql might represent `by myAlias = func()`:
        // The `group_by` array would contain `NamedExpression`s.
        const dateTruncNamedExpr: RealisticRustKqlNamedExpression = {
            alias: 'timestamp_hour',
            expression: { FunctionCall: {
                function_name: 'date_trunc',
                arguments: [ RLiteral('hour'), RCol('timestamp') ]
            }}
        };
        rustAstObject = {
            source: { name: 'events' },
            operations: [
                { Summarize: {
                    aggregations: [ { alias: 'count_', expression: { FunctionCall: { function_name: 'count', arguments: [] } } } as RealisticRustKqlNamedExpression ],
                    group_by: [
                        dateTruncNamedExpr.expression, // This is the expression part
                                                       // The transformer for group_by needs to handle NamedExpression to get the alias
                                                       // Let's adjust this mock to pass NamedExpression to group_by
                        // Corrected mock for group_by to pass NamedExpression for aliased items
                        // This requires the transformer to handle NamedExpression within group_by arrays.
                        // { NamedExpression: dateTruncNamedExpr }, // This is one way to structure if group_by is Vec<Expression> and Expression can be NamedExpression
                        // Or, if group_by itself is Vec<NamedExpression> in Rust AST (more likely for `by alias = expr`)
                        // For this mock, we'll assume group_by elements are directly expressions, and if it's a function call
                        // that needs an alias, the transformer has to find it or it's implicit.
                        // The current transformer for group_by handles string or GroupByExpression (our AST).
                        // Let's make the Rust AST for group_by also simpler for now and rely on the transformer to make it fit.
                        // The transformer expects a specific structure for date_trunc to create GroupByExpression.
                        // The most direct way is to assume the Rust AST for date_trunc in group by looks like a FunctionCall that the transformer can identify.
                        // And the alias 'timestamp_hour' is part of the NamedExpression in `summarize` context.
                        // The transformer for summarize.groupBy will need to create our GroupByExpression with the alias.
                        // This is tricky because the alias 'timestamp_hour' is for the *output column name*.
                        // The `group_by` clause in SQL uses the expression `DATE_TRUNC('hour', "timestamp")`.
                        // The `SELECT` clause uses `DATE_TRUNC('hour', "timestamp") AS "timestamp_hour"`.
                        // So, the Rust AST for `group_by` should contain the raw expression (date_trunc func call),
                        // and the `SELECT` part (derived from `group_by` and `aggregations`) needs the alias.
                        //
                        // Let's structure the mock Rust AST groupBy for `timestamp_hour = date_trunc(...)`
                        // to be a NamedExpression, as this is how KQL defines it.
                        dateTruncNamedExpr, // This is a NamedExpression. Transformer needs to handle this.
                        { alias: 'event_source_name', expression: RCol('event_source_name') } as RealisticRustKqlNamedExpression, // Even non-function group bys are NamedExpressions
                    ],
                }},
                { Sort: { clauses: [
                    { expression: RCol('timestamp_hour'), sort_order: 'Asc' } as RealisticRustKqlSortClause
                ]}},
            ],
        };
    } else if (normalizedQuery === 'events | where parsed_fields.logontype == 2 | project timestamp, user_id, parsed_fields.workstationname') {
        rustAstObject = {
            source: { name: 'events' },
            operations: [
                { Where: { predicate: { BinaryExpression: {
                    left: RPath('parsed_fields', 'LogonType'),
                    operator: '==',
                    right: RLiteral(2)
                }}}},
                { Project: { columns: [
                    { alias: 'timestamp', expression: RCol('timestamp') } as RealisticRustKqlNamedExpression,
                    { alias: 'user_id', expression: RCol('user_id') } as RealisticRustKqlNamedExpression,
                    { alias: 'parsed_fields.WorkstationName', expression: RPath('parsed_fields', 'WorkstationName') } as RealisticRustKqlNamedExpression,
                ]}},
            ]
        };
    } else if (normalizedQuery === 'events | where success == true') {
        rustAstObject = {
            source: { name: 'events' },
            operations: [
                { Where: { predicate: { BinaryExpression: { left: RCol('success'), operator: '==', right: RLiteral(true) }}}}
            ]
        };
    }
    // Add other KQL query to RealisticRustKql AST mappings here as needed...


    if (rustAstObject) {
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async delay
        return JSON.stringify(rustAstObject);
    } else {
        await new Promise(resolve => setTimeout(resolve, 5));
        const errorPayload = { error: "KQL Parsing Error (Simulated Wasm)", details: `Unsupported KQL query in Wasm simulation: ${kqlQuery}` };
        // Simulating how Wasm errors might be returned (often by throwing an Error)
        return Promise.reject(new Error(JSON.stringify(errorPayload)));
    }
}

export async function parseKqlToAst(kqlQuery: string): Promise<QueryNode | null> {
  try {
    console.log(`[WasmLoader] Received KQL: ${kqlQuery}`);
    const rustAstJsonString = await simulatedWasmCall(kqlQuery);
    // console.log(`[WasmLoader] Received (simulated) Rust AST JSON string: ${rustAstJsonString}`); // Can be very verbose

    const rustAst = JSON.parse(rustAstJsonString);
    // console.log(`[WasmLoader] Parsed (simulated) Realistic Rust AST object:`, JSON.stringify(rustAst, null, 2));

    const queryNode = transformRustAstToQueryNode(rustAst);
    if (!queryNode) {
      console.error(`[WasmLoader] Failed to transform Realistic Rust AST for query: ${kqlQuery}. Input Rust AST:`, JSON.stringify(rustAst, null, 2));
      return null;
    }

    // console.log(`[WasmLoader] Transformed to QueryNode AST:`, JSON.stringify(queryNode, null, 2));
    return queryNode;

  } catch (error: any) {
    let errorMessage = error.message;
    try {
        const parsedError = JSON.parse(error.message); // If error.message is the JSON string from reject()
        errorMessage = `Error from Wasm sim: ${parsedError.error} - ${parsedError.details}`;
        console.error(`[WasmLoader] Parsed error details from Wasm sim:`, parsedError);
    } catch (e) {
        // Not a JSON error message, use the original error message
    }
    console.error(`[WasmLoader] Error during KQL processing pipeline: ${errorMessage}`, error.stack ? `\nStack: ${error.stack}` : '');
    return null;
  }
}
