// src/lib/kql_ast.ts
export interface AstNode { type: string; }

export interface QueryNode extends AstNode {
  type: 'Query';
  source: string; // Table name
  operations: OperationNode[];
}

// --- Operation Nodes ---
export type OperationNode =
  | WhereNode
  | ProjectNode
  | TakeNode
  | SummarizeNode
  | SortNode;

export interface WhereNode extends AstNode {
  type: 'Where';
  condition: ConditionNode;
}

export interface ProjectNode extends AstNode {
  type: 'Project';
  fields: string[];
}

export interface TakeNode extends AstNode {
  type: 'Take';
  count: number;
}

// --- Summarize Node ---
export type AggFunctionType = 'count' | 'dcount' | 'min' | 'max' | 'avg' | 'sum';

export interface Aggregation {
  newColumnName: string;
  function: AggFunctionType;
  field?: string; // Field to aggregate over, not needed for count()
}

// Updated GroupByItem type to include GroupByExpression
export type GroupByItem = string | GroupByExpression;

export interface GroupByExpression extends AstNode {
    type: 'FunctionCall'; // Indicates it's a function call like date_trunc
    functionName: 'date_trunc'; // For now, only support date_trunc
    arguments: [string, string]; // e.g., ['hour', 'timestamp']
    alias: string; // e.g., 'timestamp_hour'
}

export interface SummarizeNode extends AstNode {
  type: 'Summarize';
  aggregations: Aggregation[];
  groupByFields: GroupByItem[]; // Updated to use GroupByItem
}

// --- Sort Node ---
export type SortOrder = 'asc' | 'desc';
export type NullsOrder = 'first' | 'last'; // SQL standard: NULLS FIRST / NULLS LAST

export interface SortClause {
  field: string;
  order?: SortOrder;
  nulls?: NullsOrder;
}

export interface SortNode extends AstNode {
  type: 'Sort';
  clauses: SortClause[];
}


// --- Condition Nodes (for WhereNode) ---
export type ConditionNode =
  | EqualityConditionNode
  | ComparisonConditionNode
  | StringOperationConditionNode
  | LogicalConditionNode;

export interface EqualityConditionNode extends AstNode {
  type: 'Equals'; // KQL '=='
  field: string;
  value: string | number | boolean;
}

export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '!='; // KQL '!=', '<>', '>', '<', '>=', '<='

export interface ComparisonConditionNode extends AstNode {
  type: 'Compare';
  field: string;
  operator: ComparisonOperator;
  value: string | number; // Booleans typically not used with these operators
}

export type StringOperationType = 'contains' | 'startswith' | 'endswith'; // KQL 'contains', 'startswith', 'endswith' (and their case-insensitive versions)

export interface StringOperationConditionNode extends AstNode {
  type: 'StringOperation';
  field: string;
  operator: StringOperationType;
  value: string;
  caseSensitive?: boolean; // Default to case-insensitive for KQL 'contains', 'startswith', 'endswith'
}

export type LogicalOperator = 'and' | 'or'; // KQL 'and', 'or'

export interface LogicalConditionNode extends AstNode {
  type: 'Logical';
  operator: LogicalOperator;
  conditions: ConditionNode[]; // Array of conditions to be joined by the operator
}
