// src/lib/kql_ast_transformer.ts
import {
  QueryNode, OperationNode, WhereNode, ProjectNode, TakeNode, ConditionNode,
  SummarizeNode, Aggregation, AggFunctionType, GroupByItem, GroupByExpression,
  SortNode, SortClause, SortOrder, NullsOrder,
  EqualityConditionNode, ComparisonConditionNode, ComparisonOperator,
  StringOperationConditionNode, StringOperationType,
  LogicalConditionNode, LogicalOperator
} from './kql_ast';

// --- Final Hypothesized "Actual Wasm AST" Interfaces (based on irtimmer/rust-kql + serde_json defaults) ---

// Literals (irtimmer/rust-kql/src/ast.rs -> LiteralValue)
export type ActualRustKqlLiteralValue =
  | { String: string }
  | { Long: number } // KQL 'long' type, maps to number
  | { Real: number } // KQL 'real' type, maps to number
  | { Bool: boolean }
  | { Datetime: string } // ISO 8601 string
  | { Timespan: string } // e.g., "1d", "2h"
  | { Dynamic: any[] | object | null } // For KQL dynamic type
  | { Null: null }; // Explicit null literal

// Expressions (irtimmer/rust-kql/src/ast.rs -> Expression)
// This is an enum in Rust, so in JSON it will be an object with one key.
export type ActualRustKqlExpression =
  | { Literal: ActualRustKqlLiteralValue }
  | { Column: { name: { value: string } } } // `ColumnNode` in rust-kql has `name: Identifier`
  | { Path: { expression: ActualRustKqlExpression; accessors: ActualRustKqlPathAccessor[] } }
  | { BinaryExpression: { left: ActualRustKqlExpression; op: ActualRustKqlBinaryOperator; right: ActualRustKqlExpression } }
  | { FunctionCall: { name: ActualRustKqlFunctionName; args: ActualRustKqlExpression[] } };
  // Add UnaryExpression, etc. if needed by queries

// Path Accessor (irtimmer/rust-kql/src/ast.rs -> PathAccessor)
export type ActualRustKqlPathAccessor =
  | { Member: { name: { value: string } } } // Accessing a field, e.g., parsed_fields.['field_name'] or .field_name
  | { Index: { index: ActualRustKqlExpression } }; // Array index or dynamic property access

// Binary Operators (irtimmer/rust-kql/src/ast.rs -> BinaryOperatorKind)
// These are string representations of the enum variants.
export type ActualRustKqlBinaryOperator =
  | "Add" | "Sub" | "Mul" | "Div" // Arithmetic
  | "Equal" | "NotEqual" | "GreaterThan" | "LessThan" | "GreaterThanOrEqual" | "LessThanOrEqual" // Comparison
  | "And" | "Or" // Logical
  | "Contains" | "NotContains" | "ContainsCs" | "NotContainsCs"
  | "StartsWith" | "NotStartsWith" | "StartsWithCs" | "NotStartsWithCs"
  | "EndsWith" | "NotEndsWith" | "EndsWithCs" | "NotEndsWithCs"
  | "Has" /* ... and other KQL specific operators */;

// Function Names (irtimmer/rust-kql/src/ast.rs -> FunctionName)
// Could be a simple string or a more complex structure if it supports namespaces, etc.
// For now, assume it serializes to its string representation.
export type ActualRustKqlFunctionName = string; // e.g., "count", "dcount", "date_trunc"

// Named Expressions (irtimmer/rust-kql/src/ast.rs -> NamedExpression)
// Used in `project` columns, `summarize` aggregations, and aliased `group_by` expressions.
export interface ActualRustKqlNamedExpression {
  expression: ActualRustKqlExpression;
  alias: { name: { value: string } } | null; // `alias: Option<Identifier>` in Rust
}

// Sort Clauses (irtimmer/rust-kql/src/ast.rs -> SortByOperatorClause)
export interface ActualRustKqlSortClause {
  expression: ActualRustKqlExpression; // Usually a Column or Path expression
  order?: "Asc" | "Desc"; // `Option<SortOrder>` in Rust (`SortOrder::Ascending` or `SortOrder::Descending`)
  nulls?: "First" | "Last"; // `Option<NullsOrder>` in Rust
}

// Tabular Operators (irtimmer/rust-kql/src/ast.rs -> TabularOperator)
// This is an enum in Rust. Each variant is a key in the JSON object.
export type ActualRustKqlTabularOperator =
  | { Where: { predicate: ActualRustKqlExpression } }
  | { Project: { columns: ActualRustKqlNamedExpression[] } }
  | { Take: { count: ActualRustKqlExpression } } // `Limit` in `irtimmer/rust-kql`
  | { Summarize: { aggregations: ActualRustKqlNamedExpression[]; by_clauses: ActualRustKqlNamedExpression[] } } // `by_clauses` for `group_by`
  | { SortBy: { clauses: ActualRustKqlSortClause[] } }; // `SortBy` in `irtimmer/rust-kql`

// Source for TabularExpression (irtimmer/rust-kql/src/ast.rs -> Source)
export interface ActualRustKqlSource {
    name: { value: string }; // Assumes `SimpleExpression::Column` which has an `Identifier`
    alias: { name: { value: string } } | null;
}

// Statement (irtimmer/rust-kql/src/ast.rs -> Statement)
// We are primarily interested in TabularExpression statements for queries.
export type ActualRustKqlStatement =
  | { TabularExpression: { source: ActualRustKqlSource; operations: ActualRustKqlTabularOperator[] } }
  | { Let: { name: { value: string }; expression: ActualRustKqlExpression } }; // And other statement types

// Top-level Query structure (irtimmer/rust-kql/src/ast.rs -> Query)
export interface ActualRustKqlQuery {
  statements: ActualRustKqlStatement[];
}


// --- Transformation Helper Functions ---

function extractActualLiteralValue(literalVal: ActualRustKqlLiteralValue): string | number | boolean | null {
  if ("String" in literalVal) return literalVal.String;
  if ("Long" in literalVal) return literalVal.Long; // KQL long maps to number
  if ("Real" in literalVal) return literalVal.Real; // KQL real maps to number
  if ("Bool" in literalVal) return literalVal.Bool;
  if ("Datetime" in literalVal) return literalVal.Datetime;
  if ("Null" in literalVal) return null;
  if ("Timespan" in literalVal) return literalVal.Timespan; // Keep as string for now
  if ("Dynamic" in literalVal) return JSON.stringify(literalVal.Dynamic); // stringify dynamic content for PoC
  console.warn("[ASTTransformer] Unknown actual literal type in Rust AST:", literalVal);
  return null;
}

function extractActualFieldNameOrPath(expr: ActualRustKqlExpression): string {
  if ("Column" in expr) return expr.Column.name.value;
  if ("Path" in expr) {
    let currentPath = extractActualFieldNameOrPath(expr.Path.expression);
    for (const accessor of expr.Path.accessors) {
      if ("Member" in accessor) {
        currentPath += `.${accessor.Member.name.value}`;
      } else if ("Index" in accessor) {
        // For simplicity, assume index is a literal string or number for parsed_fields keys
        // e.g. parsed_fields['some-key'] or parsed_fields[0] if it were an array
        // This part might need more robust handling for complex index expressions.
        if ("Literal" in accessor.Index.index) {
            const literalValue = extractActualLiteralValue(accessor.Index.index.Literal);
            currentPath += `.${literalValue}`; // Simplified: treating index as part of path
        } else {
            console.warn("[ASTTransformer] Non-literal index in Path not fully supported, using placeholder.");
            currentPath += `.[index]`;
        }
      }
    }
    return currentPath;
  }
  console.warn("[ASTTransformer] Cannot extract field name/path from ActualRustKqlExpression:", JSON.stringify(expr).substring(0,100));
  throw new Error(`Unsupported expression type for field extraction: ${Object.keys(expr)[0]}`);
}

function transformActualRustExpressionToConditionNode(expr: ActualRustKqlExpression): ConditionNode | null {
  if (!expr.BinaryExpression) {
    console.error("[ASTTransformer] Expected BinaryExpression for WHERE predicate, got:", JSON.stringify(expr));
    return null;
  }
  const be = expr.BinaryExpression;
  const leftOperand = be.left;
  const rightOperand = be.right;

  if (be.op.toLowerCase() === 'and' || be.op.toLowerCase() === 'or') {
    const leftCondition = transformActualRustExpressionToConditionNode(leftOperand);
    const rightCondition = transformActualRustExpressionToConditionNode(rightOperand);
    if (!leftCondition || !rightCondition) return null;
    return {
      type: 'Logical',
      operator: be.op.toLowerCase() as LogicalOperator,
      conditions: [leftCondition, rightCondition], // KQL parser might already provide a list for multiple ANDs/ORs
    } as LogicalConditionNode;
  }

  const field = extractActualFieldNameOrPath(leftOperand);
  if (!("Literal" in rightOperand)) {
    console.error("[ASTTransformer] Expected Literal on the right side of op, got:", JSON.stringify(rightOperand));
    return null;
  }
  const value = extractActualLiteralValue(rightOperand.Literal);

  switch (be.op) { // Use exact operator strings from Rust AST for reliable mapping
    case 'Equal':
      return { type: 'Equals', field, value } as EqualityConditionNode;
    case 'GreaterThan': case 'LessThan': case 'GreaterThanOrEqual': case 'LessThanOrEqual': case 'NotEqual':
      if (typeof value !== 'string' && typeof value !== 'number') return null;
      let opSymbol: ComparisonOperator = be.op as ComparisonOperator; // This direct cast is risky
      if (be.op === 'Equal') opSymbol = '=='; /* Handled above */
      if (be.op === 'NotEqual') opSymbol = '!=';
      if (be.op === 'GreaterThan') opSymbol = '>';
      if (be.op === 'LessThan') opSymbol = '<';
      if (be.op === 'GreaterThanOrEqual') opSymbol = '>=';
      if (be.op === 'LessThanOrEqual') opSymbol = '<=';
      return { type: 'Compare', field, operator: opSymbol, value } as ComparisonConditionNode;

    case 'ContainsCs': case 'StartsWithCs': case 'EndsWithCs':
      if (typeof value !== 'string') return null;
      return {
        type: 'StringOperation', field,
        operator: be.op.replace('Cs', '').toLowerCase() as StringOperationType,
        value, caseSensitive: true,
      } as StringOperationConditionNode;
    case 'Contains': case 'StartsWith': case 'EndsWith': // Case-insensitive versions
    case 'NotContains': case 'NotStartsWith': case 'NotEndsWith': // TODO: Handle 'Not' variants in our AST/Transpiler
      if (typeof value !== 'string') return null;
      if (be.op.startsWith('Not')) {
          console.warn(`[ASTTransformer] 'Not' variants of string ops like ${be.op} not fully handled yet.`);
          // For now, just pass through the positive version. A full implementation needs `NotNode` or similar.
          return {
            type: 'StringOperation', field,
            operator: be.op.replace('Not', '').toLowerCase() as StringOperationType,
            value, caseSensitive: false,
          } as StringOperationConditionNode;
      }
      return {
        type: 'StringOperation', field,
        operator: be.op.toLowerCase() as StringOperationType,
        value, caseSensitive: false,
      } as StringOperationConditionNode;

    default:
      console.error(`[ASTTransformer] Unsupported binary operator from Actual Rust AST: ${be.op}`);
      return null;
  }
}

function transformActualRustOperator(op: ActualRustKqlTabularOperator): OperationNode | null {
  if ("Where" in op) {
    const condition = transformActualRustExpressionToConditionNode(op.Where.predicate);
    return condition ? { type: 'Where', condition } as WhereNode : null;
  }
  if ("Project" in op) {
    const fields = op.Project.columns.map(namedExpr =>
        namedExpr.alias?.name.value || extractActualFieldNameOrPath(namedExpr.expression)
    );
    return { type: 'Project', fields } as ProjectNode;
  }
  if ("Take" in op) { // 'Take' in our AST, 'Limit' in irtimmer/rust-kql (if it's 'Limit')
    // Assuming irtimmer/rust-kql uses 'Limit' and it serializes to { "Limit": { "count": ... } }
    // If it serializes to { "Take": ... } then this is fine.
    // The loader should produce the key "Take" if that's what irtimmer/rust-kql uses for its 'Limit' variant.
    // For this example, we'll assume the loader produces "Take" key to match this transformer's expectation.
    if (op.Take.count && "Literal" in op.Take.count && ("Long" in op.Take.count.Literal || "Real" in op.Take.count.Literal)) {
      const countVal = ("Long" in op.Take.count.Literal) ? op.Take.count.Literal.Long : (op.Take.count.Literal as any).Real;
      return { type: 'Take', count: countVal } as TakeNode;
    }
    console.error("[ASTTransformer] Invalid Take operator structure from Actual Rust AST:", op);
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
        newColumnName: namedAggExpr.alias?.name.value || funcCall.name, // Use alias, fallback to func name
        function: funcCall.name.toLowerCase() as AggFunctionType,
        field: funcCall.args.length > 0 ? extractActualFieldNameOrPath(funcCall.args[0]) : undefined,
      };
    });
    const groupByFields: GroupByItem[] = summarizeOp.by_clauses.map(namedExpr => { // `by_clauses` in irtimmer/rust-kql
        const alias = namedExpr.alias?.name.value;
        const expr = namedExpr.expression;
        if ("FunctionCall" in expr && expr.FunctionCall.name.toLowerCase() === 'date_trunc') {
            const funcCall = expr.FunctionCall;
            if (funcCall.args.length !== 2 || !("Literal" in funcCall.args[0])) {
                throw new Error('Invalid date_trunc arguments in Actual Rust AST for group_by');
            }
            if (!alias) {
                throw new Error('date_trunc in group_by clause must have an alias.');
            }
            return {
                type: 'FunctionCall',
                functionName: 'date_trunc',
                arguments: [
                    extractActualLiteralValue(funcCall.args[0].Literal) as string,
                    extractActualFieldNameOrPath(funcCall.args[1])
                ],
                alias: alias,
            } as GroupByExpression;
        } else if ("Column" in expr || "Path" in expr) {
            return alias || extractActualFieldNameOrPath(expr); // Use alias if present, else column name
        }
        throw new Error(`Unsupported groupBy expression structure from Actual Rust AST: ${JSON.stringify(expr)}`);
    });
    return { type: 'Summarize', aggregations, groupByFields } as SummarizeNode;
  }
  if ("SortBy" in op) { // Matching `SortBy` from irtimmer/rust-kql
    const sortOp = op.SortBy; // op.Sort was from previous iteration, now it's op.SortBy
    const clauses: SortClause[] = sortOp.clauses.map(c => {
      const sortField = extractActualFieldNameOrPath(c.expression);
      const order = c.order?.toLowerCase() as SortOrder | undefined;
      let nulls: NullsOrder | undefined = undefined;
      if (c.nulls === 'First') nulls = 'first';
      else if (c.nulls === 'Last') nulls = 'last';
      return { field: sortField, order, nulls };
    });
    return { type: 'Sort', clauses } as SortNode;
  }

  console.warn(`[ASTTransformer] Unsupported Actual Rust KQL tabular operator:`, Object.keys(op)[0]);
  return null;
}


export function transformRustAstToQueryNode(rustAstJson: any): QueryNode | null {
  try {
    if (!rustAstJson || !Array.isArray(rustAstJson.statements) || rustAstJson.statements.length === 0) {
      console.error("[ASTTransformer] Invalid root Actual Rust AST JSON structure (no statements):", JSON.stringify(rustAstJson).substring(0,500));
      return null;
    }

    // For PoC, assume the first statement is the main TabularExpression
    const firstStatement = rustAstJson.statements[0];
    if (!firstStatement || !firstStatement.TabularExpression) {
        console.error("[ASTTransformer] Expected TabularExpression in first statement, got:", JSON.stringify(firstStatement).substring(0,500));
        return null;
    }
    const tabularExpr = firstStatement.TabularExpression;

    if (!tabularExpr.source || typeof tabularExpr.source.name?.value !== 'string' || !Array.isArray(tabularExpr.operations)) {
      console.error("[ASTTransformer] Invalid TabularExpression structure in Actual Rust AST:", JSON.stringify(tabularExpr).substring(0,500));
      return null;
    }
    const typedRustAst = tabularExpr as { source: ActualRustKqlSource; operations: ActualRustKqlTabularOperator[] };

    const operations: OperationNode[] = [];
    for (const op of typedRustAst.operations) {
      const transformedOp = transformActualRustOperator(op);
      if (transformedOp) {
        operations.push(transformedOp);
      } else {
        console.warn(`[ASTTransformer] Failed to transform an operator, skipping it:`, op);
      }
    }

    return {
      type: 'Query',
      source: typedRustAst.source.name.value, // Get value from Identifier
      operations: operations,
    };
  } catch (error: any) {
    console.error("[ASTTransformer] Critical error transforming Actual Rust AST to QueryNode:", error.message, error.stack);
    return null;
  }
}
