// src/lib/kql_parser_wasm_loader.ts

import { QueryNode } from './kql_ast'; // Our target AST
import {
    transformRustAstToQueryNode,
    ActualRustKqlQuery,
    ActualRustKqlStatement,
    ActualRustKqlTabularOperator,
    ActualRustKqlExpression,
    ActualRustKqlLiteralValue,
    ActualRustKqlNamedExpression,
    ActualRustKqlSortClause,
    ActualRustKqlSource,
    ActualRustKqlSearchOperator,
    ActualRustKqlExtendOperator,
    ActualRustKqlDistinctOperator,
    ActualRustKqlTopOperator,
    ActualRustKqlArrayLiteral,
    ActualRustKqlLiteralExpression,
    ActualRustKqlColumnExpression,
    ActualRustKqlPathAccessor,
    ActualRustKqlFunctionName,
    ActualRustKqlBinaryOperator
} from './kql_ast_transformer';

// Simulates calling the Wasm module's exported function.
// It now directly constructs objects matching ActualRustKql... interfaces and then stringifies them.
async function simulatedWasmCall(kqlQuery: string): Promise<string> {
    const normalizedQuery = kqlQuery.trim().replace(/\s+/g, ' ').toLowerCase();
    let rustAstObject: ActualRustKqlQuery | null = null;

    // --- Helper functions to construct "Actual Rust AST" nodes ---
    const RIdent = (name: string): { value: string } => ({ value: name });
    const RFuncIdent = (name: string): ActualRustKqlFunctionName => ({ value: name }); // Assuming simple string for now

    const RLiteral = (value: string | number | boolean | null): ActualRustKqlLiteralExpression => {
        let literalValue: ActualRustKqlLiteralValue;
        if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) || /^\d{4}-\d{2}-\d{2}$/.test(value)) literalValue = { Datetime: value };
            else if (/^\d+(d|h|m|s|ms|us|ns)$/.test(value)) literalValue = { Timespan: value };
            else literalValue = { String: value };
        } else if (typeof value === 'number') {
            literalValue = Number.isInteger(value) ? { Long: value } : { Real: value };
        } else if (typeof value === 'boolean') {
            literalValue = { Bool: value };
        } else if (value === null) {
            literalValue = { Null: null };
        } else {
            throw new Error(`Unsupported literal type for mock RLiteral: ${value}`);
        }
        return { Literal: literalValue };
    };

    const RCol = (name: string): ActualRustKqlColumnExpression => ({ Column: { name: RIdent(name) } });

    const RPath = (objectName: string, memberName: string): { Path: { expression: ActualRustKqlExpression, accessors: ActualRustKqlPathAccessor[] } } => ({
        Path: {
            expression: RCol(objectName),
            accessors: [{ Member: { name: RIdent(memberName) } }]
        }
    });

    const RNamedExpr = (alias: string, expression: ActualRustKqlExpression): ActualRustKqlNamedExpression => ({
        alias: { name: RIdent(alias) },
        expression
    });
    const RNamedCol = (name: string): ActualRustKqlNamedExpression => ({
        alias: { name: RIdent(name) },
        expression: RCol(name)
    });
    const RFuncCall = (name: string, args: ActualRustKqlExpression[]): { FunctionCall: { name: ActualRustKqlFunctionName, args: ActualRustKqlExpression[] } } => ({
        FunctionCall: { name: RFuncIdent(name), args }
    });
    const RArrayLiteral = (values: (string | number | boolean | null)[]): { ArrayLiteral: ActualRustKqlArrayLiteral } => ({
        ArrayLiteral: { Array: values.map(v => RLiteral(v).Literal) }
    });
    const RBinaryExpr = (left: ActualRustKqlExpression, op: ActualRustKqlBinaryOperator, right: ActualRustKqlExpression): { BinaryExpression: any } => ({
        BinaryExpression: { left, op, right }
    });


    // --- Define ActualRustKql ASTs for supported queries ---
    let mainTabularExpression: { source: ActualRustKqlSource; operations: ActualRustKqlTabularOperator[] } | null = null;

    // --- Existing Queries (adapted to new helpers) ---
    if (normalizedQuery === 'events | take 10') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [ { Take: { count: RLiteral(10) } } ],
        };
    } else if (normalizedQuery === 'events | where event_type_id == "4624" | project timestamp, user_id, ip_address | take 5') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [
                { Where: { predicate: RBinaryExpr(RCol('event_type_id'), 'Equal', RLiteral('4624')) } },
                { Project: { columns: [ RNamedCol('timestamp'), RNamedCol('user_id'), RNamedCol('ip_address') ]}},
                { Take: { count: RLiteral(5) } },
            ],
        };
    } else if (normalizedQuery === 'events | where event_type_id == "4625" | summarize attempts = count() by user_id | sort by attempts desc | take 10') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [
                { Where: { predicate: RBinaryExpr(RCol('event_type_id'), 'Equal', RLiteral('4625')) } },
                { Summarize: {
                    aggregations: [ RNamedExpr('attempts', RFuncCall('count', [])) ],
                    by_clauses: [ RNamedExpr('user_id', RCol('user_id')) ], // KQL `by X` is `by X=X`
                }},
                { SortBy: { clauses: [ { expression: RCol('attempts'), sort_order: 'Desc' } ]}},
                { Take: { count: RLiteral(10) } },
            ],
        };
    } else if (normalizedQuery === "events | summarize count_ = count() by timestamp_hour = date_trunc('hour', timestamp), event_source_name | sort by timestamp_hour asc") {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [
                { Summarize: {
                    aggregations: [ RNamedExpr('count_', RFuncCall('count', [])) ],
                    by_clauses: [
                        RNamedExpr('timestamp_hour', RFuncCall('date_trunc', [RLiteral('hour'), RCol('timestamp')])),
                        RNamedExpr('event_source_name', RCol('event_source_name')),
                    ],
                }},
                { SortBy: { clauses: [ { expression: RCol('timestamp_hour'), sort_order: 'Asc' } ]}},
            ],
        };
    } else if (normalizedQuery === 'events | where parsed_fields.logontype == 2 | project timestamp, user_id, parsed_fields.workstationname') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [
                { Where: { predicate: RBinaryExpr(RPath('parsed_fields', 'LogonType'), 'Equal', RLiteral(2)) }},
                { Project: { columns: [
                    RNamedCol('timestamp'), RNamedCol('user_id'),
                    RNamedExpr('parsed_fields.WorkstationName', RPath('parsed_fields', 'WorkstationName')),
                ]}},
            ]
        };
    } else if (normalizedQuery === 'events | where success == true') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [ { Where: { predicate: RBinaryExpr(RCol('success'), 'Equal', RLiteral(true)) }} ]
        };
    }

    // --- New KQL Test Cases for Phase 8 ---
    else if (normalizedQuery === 'events | search "critical error"') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [ { Search: { search_term: RLiteral("critical error") as ActualRustKqlLiteralExpression, columns: null } } ],
        };
    } else if (normalizedQuery === 'events | where timestamp < ago(5m) and severity in ("high", "critical") and message contains "failed"') {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [ { Where: { predicate: RBinaryExpr(
                RBinaryExpr(
                    RBinaryExpr(RCol('timestamp'), 'LessThan', RLiteral(fiveMinutesAgo)),
                    'And',
                    RBinaryExpr(RCol('severity'), 'In', RArrayLiteral(["High", "Critical"]))
                ),
                'And',
                RBinaryExpr(RCol('message'), 'Contains', RLiteral('failed'))
            )}}} ],
        };
    } else if (normalizedQuery === 'events | where process_name startswith "powershell" and command_line endswith ".exe"') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [ { Where: { predicate: RBinaryExpr(
                RBinaryExpr(RCol('process_name'), 'StartsWith', RLiteral('powershell')),
                'And',
                // Assuming command_line is in parsed_fields for this example based on typical event structures
                RBinaryExpr(RPath('parsed_fields', 'CommandLine'), 'EndsWith', RLiteral('.exe'))
            )}}} ],
        };
    } else if (normalizedQuery === 'events | where details matches regex "user=([^\\s]+)"') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [ { Where: { predicate: RBinaryExpr(
                RCol('details'), // Assuming 'details' is a direct column or in parsed_fields
                'MatchesRegex',
                RLiteral("user=([^\\s]+)")
            )}}} ],
        };
    } else if (normalizedQuery === 'events | extend event_hour = gethour(timestamp), user_domain = strcat(username, "@", domain)') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [ { Extend: { columns: [
                RNamedExpr('event_hour', RFuncCall('gethour', [RCol('timestamp')])),
                RNamedExpr('user_domain', RFuncCall('strcat', [RCol('username'), RLiteral('@'), RCol('domain')]))
            ]}} ],
        };
    } else if (normalizedQuery === 'events | distinct event_type_id, user_id') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [ { Distinct: { columns: [ RCol('event_type_id'), RCol('user_id') ] } } ],
        };
    } else if (normalizedQuery === 'events | top 3 by event_count desc withothers = true') {
        mainTabularExpression = {
            source: { name: RIdent('events'), alias: null },
            operations: [ { Top: {
                count: RLiteral(3),
                by_expression: RNamedExpr('event_count',RCol('event_count')),
                sort_order: 'Desc',
                with_others: RLiteral(true) as ActualRustKqlLiteralExpression
            } } ],
        };
    }


    if (mainTabularExpression) {
        rustAstObject = {
            statements: [ { TabularExpression: mainTabularExpression } ]
        };
        await new Promise(resolve => setTimeout(resolve, 10));
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

    const rustAstParsed = JSON.parse(rustAstJsonString);

    const queryNode = transformRustAstToQueryNode(rustAstParsed);
    if (!queryNode) {
      console.error(`[WasmLoader] Failed to transform Actual Rust AST for query: ${kqlQuery}. Input Rust AST:`, JSON.stringify(rustAstParsed, null, 2));
      return null;
    }

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
