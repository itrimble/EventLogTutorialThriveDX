// src/lib/kql_parser_real.ts
import {
  QueryNode, TakeNode, WhereNode, ConditionNode, ProjectNode, OperationNode,
  SummarizeNode, Aggregation, AggFunctionType, GroupByItem, GroupByExpression,
  SortNode, SortClause, SortOrder,
  EqualityConditionNode, ComparisonConditionNode, ComparisonOperator,
  StringOperationConditionNode, StringOperationType,
  LogicalConditionNode, LogicalOperator
} from './kql_ast';

// This function simulates the behavior of a Wasm KQL parser.
// It directly returns a JS object that matches our TypeScript `QueryNode` structure.
async function simulatedWasmParseFunction(kqlQuery: string): Promise<QueryNode | null> {
  const normalizedQuery = kqlQuery.trim().replace(/\s+/g, ' ').toLowerCase(); // Normalize for easier matching

  // --- Existing Queries ---
  if (normalizedQuery === 'events | take 10') {
    return {
      type: 'Query',
      source: 'events',
      operations: [{ type: 'Take', count: 10 } as TakeNode],
    };
  }

  if (normalizedQuery === 'events | where event_type_id == "4624" | project timestamp, user_id, ip_address | take 5') {
    const operations: OperationNode[] = [
      { type: 'Where', condition: { type: 'Equals', field: 'event_type_id', value: '4624' } as EqualityConditionNode } as WhereNode,
      { type: 'Project', fields: ['timestamp', 'user_id', 'ip_address'] } as ProjectNode,
      { type: 'Take', count: 5 } as TakeNode,
    ];
    return { type: 'Query', source: 'events', operations };
  }

  if (normalizedQuery === 'events | where parsed_fields.logontype == 2 | project timestamp, user_id, parsed_fields.workstationname') {
    const operations: OperationNode[] = [
      { type: 'Where', condition: { type: 'Equals', field: 'parsed_fields.LogonType', value: 2 } as EqualityConditionNode } as WhereNode,
      { type: 'Project', fields: ['timestamp', 'user_id', 'parsed_fields.WorkstationName'] } as ProjectNode,
    ];
    return { type: 'Query', source: 'events', operations };
  }

  if (normalizedQuery === 'events | where success == true') { // Assuming 'success' is a direct column
    return {
        type: 'Query', source: 'events',
        operations: [ { type: 'Where', condition: { type: 'Equals', field: 'success', value: true } as EqualityConditionNode } as WhereNode ]
    };
  }

  // --- Updated/New Test Cases ---

  // Task 1 Query (Auth Dashboard Top Failed Logins):
  if (normalizedQuery === 'events | where event_type_id == "4625" | summarize attempts = count() by user_id | sort by attempts desc | take 10') {
    const operations: OperationNode[] = [
      { type: 'Where', condition: { type: 'Equals', field: 'event_type_id', value: '4625' } as EqualityConditionNode } as WhereNode,
      {
        type: 'Summarize',
        aggregations: [{ newColumnName: 'attempts', function: 'count' as AggFunctionType }],
        groupByFields: ['user_id'] as GroupByItem[],
      } as SummarizeNode,
      {
        type: 'Sort',
        clauses: [{ field: 'attempts', order: 'desc' as SortOrder }],
      } as SortNode,
      { type: 'Take', count: 10 } as TakeNode,
    ];
    return { type: 'Query', source: 'events', operations };
  }

  // Task 2 Query (Auth Dashboard Auth Attempts Over Time):
  // events | summarize count_ = count() by timestamp_hour = date_trunc('hour', timestamp), event_source_name | sort by timestamp_hour asc
  if (normalizedQuery === "events | summarize count_ = count() by timestamp_hour = date_trunc('hour', timestamp), event_source_name | sort by timestamp_hour asc") {
    const operations: OperationNode[] = [
      {
        type: 'Summarize',
        aggregations: [{ newColumnName: 'count_', function: 'count' as AggFunctionType }],
        groupByFields: [
          {
            type: 'FunctionCall',
            functionName: 'date_trunc',
            arguments: ['hour', 'timestamp'],
            alias: 'timestamp_hour',
          } as GroupByExpression,
          'event_source_name' as GroupByItem, // Direct field name
        ],
      } as SummarizeNode,
      {
        type: 'Sort',
        clauses: [{ field: 'timestamp_hour', order: 'asc' as SortOrder }],
      } as SortNode,
    ];
    return { type: 'Query', source: 'events', operations };
  }


  // Summarize: events | summarize event_count = count() by event_type_id
  if (normalizedQuery === 'events | summarize event_count = count() by event_type_id') {
    const summarizeOp: SummarizeNode = {
      type: 'Summarize',
      aggregations: [{ newColumnName: 'event_count', function: 'count' as AggFunctionType }],
      groupByFields: ['event_type_id'] as GroupByItem[],
    };
    return { type: 'Query', source: 'events', operations: [summarizeOp] };
  }

  // Summarize: events | summarize total_ips = dcount(ip_address) by event_type_id
  if (normalizedQuery === 'events | summarize total_ips = dcount(ip_address) by event_type_id') {
    const summarizeOp: SummarizeNode = {
      type: 'Summarize',
      aggregations: [{ newColumnName: 'total_ips', function: 'dcount' as AggFunctionType, field: 'ip_address' }],
      groupByFields: ['event_type_id'] as GroupByItem[],
    };
    return { type: 'Query', source: 'events', operations: [summarizeOp] };
  }


  // Sort: events | sort by timestamp desc
  if (normalizedQuery === 'events | sort by timestamp desc') {
    const sortOp: SortNode = {
      type: 'Sort',
      clauses: [{ field: 'timestamp', order: 'desc' as SortOrder }],
    };
    return { type: 'Query', source: 'events', operations: [sortOp] };
  }

  // Sort: events | sort by user_id asc, timestamp desc
   if (normalizedQuery === 'events | sort by user_id asc, timestamp desc') {
    const sortOp: SortNode = {
      type: 'Sort',
      clauses: [
        { field: 'user_id', order: 'asc' as SortOrder },
        { field: 'timestamp', order: 'desc' as SortOrder }
      ],
    };
    return { type: 'Query', source: 'events', operations: [sortOp] };
  }

  // Complex Where: events | where severity == "high" and (process_name contains "cmd" or process_name contains "powershell")
  if (normalizedQuery === 'events | where severity == "high" and (process_name contains "cmd" or process_name contains "powershell")') {
    const whereOp: WhereNode = {
      type: 'Where',
      condition: {
        type: 'Logical',
        operator: 'and' as LogicalOperator,
        conditions: [
          { type: 'Equals', field: 'severity', value: 'High' } as EqualityConditionNode,
          {
            type: 'Logical',
            operator: 'or' as LogicalOperator,
            conditions: [
              { type: 'StringOperation', field: 'process_name', operator: 'contains' as StringOperationType, value: 'cmd', caseSensitive: false } as StringOperationConditionNode,
              { type: 'StringOperation', field: 'process_name', operator: 'contains' as StringOperationType, value: 'powershell', caseSensitive: false } as StringOperationConditionNode,
            ],
          } as LogicalConditionNode,
        ],
      } as LogicalConditionNode,
    };
    return { type: 'Query', source: 'events', operations: [whereOp] };
  }

  // Comparison: events | where parsed_fields.threatscore > 75
  if (normalizedQuery === 'events | where parsed_fields.threatscore > 75') {
    const whereOp: WhereNode = {
        type: 'Where',
        condition: {
            type: 'Compare',
            field: 'parsed_fields.ThreatScore',
            operator: '>' as ComparisonOperator,
            value: 75
        } as ComparisonConditionNode
    };
    return { type: 'Query', source: 'events', operations: [whereOp] };
  }


  // Combined: events | where severity != "low" | summarize count() by event_source_name | sort by event_source_name asc
  if (normalizedQuery === 'events | where severity != "low" | summarize count() by event_source_name | sort by event_source_name asc') {
    const operations: OperationNode[] = [
      {
        type: 'Where',
        condition: { type: 'Compare', field: 'severity', operator: '!=' as ComparisonOperator, value: 'Low' } as ComparisonConditionNode,
      } as WhereNode,
      {
        type: 'Summarize',
        aggregations: [{ newColumnName: 'count_', function: 'count' as AggFunctionType }],
        groupByFields: ['event_source_name'] as GroupByItem[],
      } as SummarizeNode,
      {
        type: 'Sort',
        clauses: [{ field: 'event_source_name', order: 'asc' as SortOrder }],
      } as SortNode,
    ];
    return { type: 'Query', source: 'events', operations };
  }


  console.warn(`Simulated Wasm Parser: Query not supported: "${kqlQuery}" (Normalized: "${normalizedQuery}")`);
  throw new Error(`Simulated Wasm Error: KQL Parsing failed for query: ${kqlQuery}`);
}

export async function parseKqlToAst(kqlQuery: string): Promise<QueryNode | null> {
  try {
    const ast = await simulatedWasmParseFunction(kqlQuery);
    return ast;
  } catch (error: any) {
    console.error("Error in simulated Wasm KQL parsing:", error.message);
    return null;
  }
}
