// src/lib/kql_rust_ast_samples.ts

// These are simplified, conceptual JSON string representations of what a Rust KQL parser
// (like one based on irtimmer/rust-kql, after `serde_json::to_string`) might output.
// The actual structure from irtimmer/rust-kql is more complex and detailed.
// These samples are designed to be distinct from our `QueryNode` AST (in kql_ast.ts)
// to make the transformation step in `kql_ast_transformer.ts` meaningful for the PoC.

// KQL: events | take 10
export const RUST_AST_TAKE_10 = JSON.stringify({
  table: "events",
  operators: [
    {
      kind: "Take",
      expression: {
        kind: "Literal",
        value: 10,
      },
    },
  ],
});

// KQL: events | where event_type_id == "4624" | project timestamp, user_id
export const RUST_AST_WHERE_PROJECT = JSON.stringify({
  table: "events",
  operators: [
    {
      kind: "Where",
      predicate: {
        kind: "Comparison",
        left: {
          kind: "Column",
          name: "event_type_id",
        },
        op: "==", // In irtimmer/rust-kql, this might be an enum like 'Equal'
        right: {
          kind: "Literal",
          value: "4624",
        },
      },
    },
    {
      kind: "Project",
      columns: [
        { kind: "Column", name: "timestamp" },
        { kind: "Column", name: "user_id" },
      ],
    },
  ],
});

// KQL: events | summarize event_count = count() by event_type_id
export const RUST_AST_SUMMARIZE_COUNT = JSON.stringify({
  table: "events",
  operators: [
    {
      kind: "Summarize",
      aggregations: [
        {
          alias: "event_count",
          function: "count", // In irtimmer/rust-kql, this might be an enum or a struct
          arguments: [],     // count() has no direct arguments in this form
        },
      ],
      groupBy: [ // In irtimmer/rust-kql, groupBy might be called 'by_clauses' or similar
        {
          kind: "Column",
          name: "event_type_id",
        },
      ],
    },
  ],
});

// KQL: events | where parsed_fields.LogonType == 2
// Note: irtimmer/rust-kql might parse 'parsed_fields.LogonType' into a specific expression type
// representing member access. For this PoC, we'll simplify it as a "Column" with a dot.
export const RUST_AST_WHERE_PARSED_FIELDS_NUMERIC = JSON.stringify({
  table: "events",
  operators: [
    {
      kind: "Where",
      predicate: {
        kind: "Comparison",
        left: {
          kind: "Column",
          name: "parsed_fields.LogonType", // Simplified representation
        },
        op: "==",
        right: {
          kind: "Literal",
          value: 2, // Numeric literal
        },
      },
    },
  ],
});

// KQL: events | where success == true
export const RUST_AST_WHERE_BOOLEAN = JSON.stringify({
    table: "events",
    operators: [
      {
        kind: "Where",
        predicate: {
          kind: "Comparison",
          left: { kind: "Column", name: "success" },
          op: "==",
          right: { kind: "Literal", value: true } // Boolean literal
        }
      }
    ]
});

// KQL for "Top 10 Users with Failed Logins"
// events | where event_type_id == "4625" | summarize attempts = count() by user_id | sort by attempts desc | take 10
export const RUST_AST_TOP_FAILED_LOGINS = JSON.stringify({
  table: "events",
  operators: [
    {
      kind: "Where",
      predicate: {
        kind: "Comparison",
        left: { kind: "Column", name: "event_type_id" },
        op: "==",
        right: { kind: "Literal", value: "4625" },
      },
    },
    {
      kind: "Summarize",
      aggregations: [ { alias: "attempts", function: "count", arguments: [] } ],
      groupBy: [ { kind: "Column", name: "user_id" } ],
    },
    {
      kind: "Sort",
      clauses: [ { column: { kind: "Column", name: "attempts" }, direction: "Descending" } ], // Note: 'direction' might be 'Desc' or an enum
    },
    {
      kind: "Take",
      expression: { kind: "Literal", value: 10 },
    },
  ],
});

// KQL for "Authentication Attempts Over Time"
// events | summarize count_ = count() by timestamp_hour = date_trunc('hour', timestamp), event_source_name | sort by timestamp_hour asc
export const RUST_AST_AUTH_ATTEMPTS_TIME = JSON.stringify({
  table: "events",
  operators: [
    {
      kind: "Summarize",
      aggregations: [ { alias: "count_", function: "count", arguments: [] } ],
      groupBy: [
        {
          kind: "FunctionCall", // This is a conceptual representation
          functionName: "date_trunc",
          arguments: [ { kind: "Literal", value: "hour" }, { kind: "Column", name: "timestamp" } ],
          alias: "timestamp_hour",
        },
        { kind: "Column", name: "event_source_name" },
      ],
    },
    {
      kind: "Sort",
      clauses: [ { column: { kind: "Column", name: "timestamp_hour" }, direction: "Ascending" } ], // Note: 'direction' might be 'Asc'
    },
  ],
});
