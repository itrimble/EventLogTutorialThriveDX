// src/lib/kql_ast_transformer.ts
import {
  QueryNode, OperationNode, WhereNode, ProjectNode, TakeNode, ConditionNode,
  SummarizeNode, Aggregation, AggFunctionType, GroupByItem, GroupByExpression,
  SortNode, SortClause, SortOrder, NullsOrder,
  EqualityConditionNode, ComparisonConditionNode, ComparisonOperator,
  StringOperationConditionNode, StringOperationType,
  LogicalConditionNode, LogicalOperator
} from './kql_ast';

// --- Realistic "Rust KQL AST" Interfaces (Hypothesized from serde_json on irtimmer/rust-kql) ---

export type RealisticRustKqlLiteralValue =
  | { String: string }
  | { Number: number }
  | { Boolean: boolean }
  | { Datetime: string }
  | { Timespan: string }
  | { Null: null };

export type RealisticRustKqlExpression =
  | { Literal: RealisticRustKqlLiteralValue }
  | { Column: { name: string } }
  | { Path: { object: RealisticRustKqlExpression, member: string } }
  | { BinaryExpression: { left: RealisticRustKqlExpression; operator: string; right: RealisticRustKqlExpression } }
  | { FunctionCall: { function_name: string; arguments: RealisticRustKqlExpression[] } };

export interface RealisticRustKqlNamedExpression {
  expression: RealisticRustKqlExpression;
  alias: string;
}

export interface RealisticRustKqlSortClause {
  expression: RealisticRustKqlExpression;
  sort_order?: 'Asc' | 'Desc';
  nulls_first?: boolean | null;
}

export type RealisticRustKqlTabularOperator =
  | { Where: { predicate: RealisticRustKqlExpression } }
  | { Project: { columns: RealisticRustKqlNamedExpression[] } }
  | { Take: { count: RealisticRustKqlExpression } }
  // Updated: group_by is now RealisticRustKqlNamedExpression[] to capture aliases directly
  | { Summarize: { aggregations: RealisticRustKqlNamedExpression[]; group_by: RealisticRustKqlNamedExpression[] } }
  | { Sort: { clauses: RealisticRustKqlSortClause[] } };

export interface RealisticRustKqlQuery {
  source: { name: string };
  operations: RealisticRustKqlTabularOperator[];
}


// --- Transformation Helper Functions ---

function extractLiteralValue(literalVal: RealisticRustKqlLiteralValue): string | number | boolean | null {
  if ('String' in literalVal) return literalVal.String;
  if ('Number' in literalVal) return literalVal.Number;
  if ('Boolean' in literalVal) return literalVal.Boolean;
  if ('Datetime' in literalVal) return literalVal.Datetime;
  if ('Null' in literalVal) return null;
  if ('Timespan' in literalVal) return literalVal.Timespan;
  console.warn("[ASTTransformer] Unknown literal type in Rust AST:", literalVal);
  return null;
}

function extractFieldNameOrPath(expr: RealisticRustKqlExpression): string {
  if ('Column' in expr) return expr.Column.name;
  if ('Path' in expr) {
    const objectName = extractFieldNameOrPath(expr.Path.object);
    return `${objectName}.${expr.Path.member}`;
  }
  console.warn("[ASTTransformer] Cannot extract simple field name/path from expression:", JSON.stringify(expr));
  throw new Error(`Unsupported expression type for field extraction: ${Object.keys(expr)[0]}`);
}


function transformRealisticExpressionToConditionNode(expr: RealisticRustKqlExpression): ConditionNode | null {
  if (!expr.BinaryExpression) {
    console.error("[ASTTransformer] Expected BinaryExpression for WHERE predicate, got:", JSON.stringify(expr));
    return null;
  }
  const be = expr.BinaryExpression;
  const leftOperand = be.left;
  const rightOperand = be.right;

  if (be.operator.toLowerCase() === 'and' || be.operator.toLowerCase() === 'or') {
    const leftCondition = transformRealisticExpressionToConditionNode(leftOperand);
    const rightCondition = transformRealisticExpressionToConditionNode(rightOperand);
    if (!leftCondition || !rightCondition) {
      console.error("[ASTTransformer] Failed to transform one or both sides of a logical expression.");
      return null;
    }
    return {
      type: 'Logical',
      operator: be.operator.toLowerCase() as LogicalOperator,
      conditions: [leftCondition, rightCondition],
    } as LogicalConditionNode;
  }

  const field = extractFieldNameOrPath(leftOperand);
  if (!rightOperand || !('Literal' in rightOperand)) {
    console.error("[ASTTransformer] Expected Literal on the right side of comparison/equality, got:", JSON.stringify(rightOperand));
    return null;
  }
  const value = extractLiteralValue(rightOperand.Literal);

  switch (be.operator.toLowerCase()) {
    case '==': case 'equal':
      return { type: 'Equals', field, value } as EqualityConditionNode;
    case '>': case 'greaterthan':
    case '<': case 'lessthan':
    case '>=': case 'greaterthanorequal':
    case '<=': case 'lessthanorequal':
    case '!=': case '<>': case 'notequal':
      if (typeof value !== 'string' && typeof value !== 'number') {
        console.error(`[ASTTransformer] Invalid value type for comparison operator ${be.operator}:`, value);
        return null;
      }
      let compOp = be.operator as ComparisonOperator;
      // Basic mapping for verbose Rust KQL operator names if they occur
      if (be.operator.toLowerCase() === 'equal') compOp = '==';
      if (be.operator.toLowerCase() === 'notequal' || be.operator.toLowerCase() === '<>') compOp = '!=';
      if (be.operator.toLowerCase() === 'greaterthan') compOp = '>';
      if (be.operator.toLowerCase() === 'lessthan') compOp = '<';
      if (be.operator.toLowerCase() === 'greaterthanorequal') compOp = '>=';
      if (be.operator.toLowerCase() === 'lessthanorequal') compOp = '<=';
      return { type: 'Compare', field, operator: compOp, value } as ComparisonConditionNode;

    case 'contains_cs':
    case 'startswith_cs':
    case 'endswith_cs':
      if (typeof value !== 'string') return null;
      return {
        type: 'StringOperation', field,
        operator: be.operator.replace('_cs', '') as StringOperationType,
        value, caseSensitive: true,
      } as StringOperationConditionNode;
    case 'contains':
    case 'startswith':
    case 'endswith':
      if (typeof value !== 'string') return null;
      return {
        type: 'StringOperation', field,
        operator: be.operator as StringOperationType,
        value, caseSensitive: false,
      } as StringOperationConditionNode;

    default:
      console.error(`[ASTTransformer] Unsupported binary operator from Rust AST: ${be.operator}`);
      return null;
  }
}


function transformRealisticOperator(op: RealisticRustKqlTabularOperator): OperationNode | null {
  if ("Where" in op) {
    const condition = transformRealisticExpressionToConditionNode(op.Where.predicate);
    return condition ? { type: 'Where', condition } as WhereNode : null;
  }
  if ("Project" in op) {
    const fields = op.Project.columns.map(namedExpr => namedExpr.alias || extractFieldNameOrPath(namedExpr.expression));
    return { type: 'Project', fields } as ProjectNode;
  }
  if ("Take" in op) {
    if (op.Take.count && "Literal" in op.Take.count && "Number" in op.Take.count.Literal) {
      return { type: 'Take', count: op.Take.count.Literal.Number } as TakeNode;
    }
    console.error("[ASTTransformer] Invalid Take operator structure from Rust AST:", op);
    return null;
  }
  if ("Summarize" in op) {
    const summarizeOp = op.Summarize;
    const aggregations: Aggregation[] = summarizeOp.aggregations.map(namedAggExpr => {
      if (!("FunctionCall" in namedAggExpr.expression)) {
        throw new Error(`Expected FunctionCall in summarize aggregation, got ${Object.keys(namedAggExpr.expression)[0]}`);
      }
      const funcCall = namedAggExpr.expression.FunctionCall;
      return {
        newColumnName: namedAggExpr.alias,
        function: funcCall.function_name.toLowerCase() as AggFunctionType,
        field: funcCall.arguments.length > 0 ? extractFieldNameOrPath(funcCall.arguments[0]) : undefined,
      };
    });
    const groupByFields: GroupByItem[] = summarizeOp.group_by.map(namedGbExpr => {
        // Now group_by elements are RealisticRustKqlNamedExpression
        if ("FunctionCall" in namedGbExpr.expression && namedGbExpr.expression.FunctionCall.function_name.toLowerCase() === 'date_trunc') {
            const funcCall = namedGbExpr.expression.FunctionCall;
            if (funcCall.arguments.length !== 2 || !("Literal" in funcCall.arguments[0])) {
                throw new Error('Invalid date_trunc arguments in Rust AST for group_by');
            }
            return {
                type: 'FunctionCall',
                functionName: 'date_trunc', // Already checked it's date_trunc
                arguments: [
                    extractLiteralValue(funcCall.arguments[0].Literal) as string, // e.g. 'hour'
                    extractFieldNameOrPath(funcCall.arguments[1]) // e.g. 'timestamp'
                ],
                alias: namedGbExpr.alias, // Use the alias from NamedExpression
            } as GroupByExpression;
        } else if ("Column" in namedGbExpr.expression || "Path" in namedGbExpr.expression) {
            // If it's a simple column or path, use its alias (which is often the name itself if not explicitly aliased in KQL `by` clause)
            return namedGbExpr.alias || extractFieldNameOrPath(namedGbExpr.expression);
        }
        throw new Error(`Unsupported groupBy expression structure from Rust AST: ${JSON.stringify(namedGbExpr)}`);
    });
    return { type: 'Summarize', aggregations, groupByFields } as SummarizeNode;
  }
  if ("Sort" in op) {
    const sortOp = op.Sort;
    const clauses: SortClause[] = sortOp.clauses.map(c => {
      const sortField = c.expression && ("Column" in c.expression) ? c.expression.Column.name : 'unknown_sort_field'; // Simplified: assumes sort by direct column name or alias
      const order = c.sort_order?.toLowerCase() as SortOrder | undefined;
      let nulls: NullsOrder | undefined = undefined;
      if (c.nulls_first === true) nulls = 'first';
      else if (c.nulls_first === false) nulls = 'last';
      return { field: sortField, order, nulls };
    });
    return { type: 'Sort', clauses } as SortNode;
  }

  console.warn(`[ASTTransformer] Unsupported Realistic Rust KQL tabular operator:`, op);
  return null;
}


export function transformRustAstToQueryNode(rustAstJson: any): QueryNode | null {
  try {
    if (!rustAstJson || !rustAstJson.source || typeof rustAstJson.source.name !== 'string' || !Array.isArray(rustAstJson.operations)) {
      console.error("[ASTTransformer] Invalid root Rust AST JSON structure:", JSON.stringify(rustAstJson).substring(0,500));
      return null;
    }
    const typedRustAst = rustAstJson as RealisticRustKqlQuery;

    const operations: OperationNode[] = [];
    for (const op of typedRustAst.operations) {
      const transformedOp = transformRealisticOperator(op);
      if (transformedOp) {
        operations.push(transformedOp);
      } else {
        console.warn(`[ASTTransformer] Failed to transform an operator, skipping it:`, op);
      }
    }

    return {
      type: 'Query',
      source: typedRustAst.source.name,
      operations: operations,
    };
  } catch (error: any) {
    console.error("[ASTTransformer] Critical error transforming Realistic Rust AST to QueryNode:", error.message, error.stack);
    return null;
  }
}
