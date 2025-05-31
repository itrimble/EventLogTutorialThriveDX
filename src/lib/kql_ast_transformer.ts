// src/lib/kql_ast_transformer.ts

import {
  QueryNode, OperationNode, WhereNode, ProjectNode, TakeNode, ConditionNode,
  SummarizeNode, Aggregation, AggFunctionType, GroupByItem, GroupByExpression,
  SortNode, SortClause, SortOrder,
  EqualityConditionNode, ComparisonConditionNode, ComparisonOperator,
  StringOperationConditionNode, StringOperationType, // Assuming String ops might come from Rust AST too
  LogicalConditionNode, LogicalOperator
} from './kql_ast';

// --- Interfaces for the simplified "Rust KQL AST" structure (as in kql_rust_ast_samples.ts) ---
// These are conceptual and would need to align with the actual JSON output of the Rust Wasm parser.
interface RustAstExpression {
  kind: string;
  value?: any;
  name?: string;
  left?: RustAstExpression;
  right?: RustAstExpression;
  op?: string; // For comparison operators
  functionName?: string; // For function calls like date_trunc
  arguments?: RustAstExpression[];
  alias?: string;
  columns?: RustAstExpression[]; // For Project
}

interface RustAstOperator {
  kind: string; // e.g., "Take", "Where", "Project", "Summarize", "Sort"
  expression?: RustAstExpression; // For Take
  predicate?: RustAstExpression; // For Where
  columns?: RustAstExpression[]; // For Project
  aggregations?: RustAstAggregation[]; // For Summarize
  groupBy?: RustAstExpression[]; // For Summarize by_clauses
  clauses?: RustAstSortClause[]; // For Sort
}

interface RustAstAggregation {
  alias: string;
  function: string; // e.g., "count", "dcount"
  arguments: RustAstExpression[]; // e.g., empty for count(), one for dcount(column)
}

interface RustAstSortClause {
  column: RustAstExpression; // Should resolve to a column name string
  direction?: string; // e.g., "Ascending", "Descending"
}

interface RustKqlAst {
  table: string;
  operators: RustAstOperator[];
}

// --- Transformation Functions ---

function transformRustExpressionToKqlField(expr: RustAstExpression): string {
  if (expr.kind === 'Column' && expr.name) {
    return expr.name;
  }
  // This is a simplification. Real KQL expressions can be more complex (e.g., bin(), functions)
  // and might not always map directly to a single field string for our current AST.
  // For parsed_fields.LogonType, the Rust AST sample directly uses "parsed_fields.LogonType" as column name.
  throw new Error(`Unsupported Rust AST expression kind for field: ${expr.kind}`);
}

function transformRustPredicateToConditionNode(predicate: RustAstExpression): ConditionNode {
  if (predicate.kind === 'Comparison' && predicate.left && predicate.right && predicate.op) {
    const field = transformRustExpressionToKqlField(predicate.left);
    const value = predicate.right.value; // Assuming right side is always a Literal for PoC

    if (predicate.op === '==') {
      return { type: 'Equals', field, value } as EqualityConditionNode;
    }
    // Add other comparison operators if the Rust AST supports them distinctly
    if (['>', '<', '>=', '<=', '!='].includes(predicate.op)) {
        return { type: 'Compare', field, operator: predicate.op as ComparisonOperator, value } as ComparisonConditionNode;
    }
    // Potentially handle string operations if they appear as a 'Comparison' kind with specific ops
    if (predicate.op.toLowerCase() === 'contains' || predicate.op.toLowerCase() === 'startswith' || predicate.op.toLowerCase() === 'endswith') {
        return {
            type: 'StringOperation',
            field,
            operator: predicate.op.toLowerCase() as StringOperationType,
            value: String(value), // Ensure value is string
            caseSensitive: false // Default KQL behavior for these
        } as StringOperationConditionNode;
    }
    throw new Error(`Unsupported comparison operator in Rust AST: ${predicate.op}`);
  }
  // Placeholder for logical operators if Rust AST supports them in a nested way
  // if (predicate.kind === 'Logical' && predicate.operator && predicate.conditions) { ... }
  throw new Error(`Unsupported Rust AST predicate kind: ${predicate.kind}`);
}

function transformRustOperatorToOperationNode(op: RustAstOperator): OperationNode {
  switch (op.kind) {
    case 'Take':
      if (op.expression && op.expression.kind === 'Literal' && typeof op.expression.value === 'number') {
        return { type: 'Take', count: op.expression.value } as TakeNode;
      }
      throw new Error('Invalid Take operator in Rust AST');

    case 'Where':
      if (op.predicate) {
        return { type: 'Where', condition: transformRustPredicateToConditionNode(op.predicate) } as WhereNode;
      }
      throw new Error('Invalid Where operator in Rust AST');

    case 'Project':
      if (op.columns && Array.isArray(op.columns)) {
        const fields = op.columns.map(col => transformRustExpressionToKqlField(col));
        return { type: 'Project', fields } as ProjectNode;
      }
      throw new Error('Invalid Project operator in Rust AST');

    case 'Summarize':
      const summarizeNode: Partial<SummarizeNode> = { type: 'Summarize' };
      summarizeNode.aggregations = [];
      if (op.aggregations && Array.isArray(op.aggregations)) {
        summarizeNode.aggregations = op.aggregations.map(agg => {
          const aggregation: Aggregation = {
            newColumnName: agg.alias,
            function: agg.function.toLowerCase() as AggFunctionType, // e.g. "count"
          };
          if (agg.arguments && agg.arguments.length > 0) {
            // Assuming first argument is the field for dcount, min, max etc.
            aggregation.field = transformRustExpressionToKqlField(agg.arguments[0]);
          }
          return aggregation;
        });
      }
      summarizeNode.groupByFields = [];
      if (op.groupBy && Array.isArray(op.groupBy)) {
        summarizeNode.groupByFields = op.groupBy.map(gb => {
          if (gb.kind === 'Column' && gb.name) {
            return gb.name as GroupByItem;
          } else if (gb.kind === 'FunctionCall' && gb.functionName === 'date_trunc' && gb.alias && gb.arguments && gb.arguments.length === 2) {
            return {
              type: 'FunctionCall',
              functionName: 'date_trunc',
              arguments: [gb.arguments[0].value as string, transformRustExpressionToKqlField(gb.arguments[1])], // arg1 is literal, arg2 is column
              alias: gb.alias,
            } as GroupByExpression;
          }
          throw new Error(`Unsupported groupBy item in Rust AST Summarize: ${JSON.stringify(gb)}`);
        });
      }
      return summarizeNode as SummarizeNode;

    case 'Sort':
        if (op.clauses && Array.isArray(op.clauses)) {
            const sortClauses: SortClause[] = op.clauses.map(c => {
                const fieldName = transformRustExpressionToKqlField(c.column);
                let order: SortOrder | undefined = undefined;
                if (c.direction) {
                    if (c.direction.toLowerCase() === 'ascending') order = 'asc';
                    if (c.direction.toLowerCase() === 'descending') order = 'desc';
                }
                return { field: fieldName, order } as SortClause;
            });
            return { type: 'Sort', clauses: sortClauses } as SortNode;
        }
        throw new Error('Invalid Sort operator in Rust AST');

    default:
      throw new Error(`Unsupported Rust AST operator kind: ${op.kind}`);
  }
}


export function transformRustAstToQueryNode(rustAst: any): QueryNode | null {
  try {
    // Basic validation of the incoming rustAst structure
    if (!rustAst || typeof rustAst.table !== 'string' || !Array.isArray(rustAst.operators)) {
      console.error("Invalid Rust AST structure:", rustAst);
      return null;
    }

    const typedRustAst = rustAst as RustKqlAst; // Cast after validation

    const operations: OperationNode[] = typedRustAst.operators.map(op =>
      transformRustOperatorToOperationNode(op)
    );

    return {
      type: 'Query',
      source: typedRustAst.table,
      operations: operations,
    };
  } catch (error: any) {
    console.error("Error transforming Rust AST to QueryNode:", error.message, error.stack);
    return null;
  }
}
