// src/lib/kql_ast_transformer.ts
import {
  QueryNode, OperationNode, WhereNode, ProjectNode, TakeNode, ConditionNode,
  SummarizeNode, Aggregation, AggFunctionType, GroupByItem, GroupByExpression,
  SortNode, SortClause, SortOrder, NullsOrder,
  EqualityConditionNode, ComparisonConditionNode, ComparisonOperator,
  StringOperationConditionNode, StringOperationType,
  LogicalConditionNode, LogicalOperator,
  SearchNode, ExtendNode, DistinctNode, TopNode, ExtendedColumn, KqlExpressionValue,
  InConditionNode, MatchesRegexConditionNode
} from './kql_ast';

// --- Canonical "Actual Wasm AST" Interfaces (Hypothesized from irtimmer/rust-kql + serde_json defaults) ---
// Using snake_case for fields from Rust AST where applicable.

export interface ActualRustKqlIdentifier { value: string; }

export type ActualRustKqlLiteralValue =
  | { String: string }
  | { Long: number }
  | { Real: number }
  | { Bool: boolean }
  | { Datetime: string } // ISO 8601 string
  | { Timespan: string } // e.g., "1d", "2h30m"
  | { Dynamic: any[] | object | null }
  | { Null: null };

export interface ActualRustKqlArrayLiteral { // For 'in' operator
    Array: ActualRustKqlLiteralValue[];
}

export type ActualRustKqlExpression =
  | { Literal: ActualRustKqlLiteralValue }
  | { ArrayLiteral: ActualRustKqlArrayLiteral }
  | { Column: { name: ActualRustKqlIdentifier } }
  | { Path: { expression: ActualRustKqlExpression; accessors: ActualRustKqlPathAccessor[] } }
  | { BinaryExpression: { left: ActualRustKqlExpression; op: ActualRustKqlBinaryOperator; right: ActualRustKqlExpression } }
  | { FunctionCall: { name: ActualRustKqlFunctionName; args: ActualRustKqlExpression[] } };
  // Add UnaryExpression, etc. if needed by queries

export type ActualRustKqlPathAccessor =
  | { Member: { name: ActualRustKqlIdentifier } }
  | { Index: { index: ActualRustKqlExpression } };

export type ActualRustKqlBinaryOperator = // Matches BinaryOperatorKind in irtimmer/rust-kql
  | "Add" | "Sub" | "Mul" | "Div" | "Mod"
  | "Equal" | "NotEqual" | "GreaterThan" | "LessThan" | "GreaterThanOrEqual" | "LessThanOrEqual"
  | "And" | "Or"
  | "Contains" | "NotContains" | "ContainsCs" | "NotContainsCs"
  | "StartsWith" | "NotStartsWith" | "StartsWithCs" | "NotStartsWithCs"
  | "EndsWith" | "NotEndsWith" | "EndsWithCs" | "NotEndsWithCs"
  | "Has" | "HasCs" | "HasPrefix" | "HasSuffix" // More KQL specific string/set ops
  | "In" | "NotIn" | "InCs" | "NotInCs"
  | "MatchesRegex";

export type ActualRustKqlFunctionName = ActualRustKqlIdentifier; // e.g., { value: "count" }

export interface ActualRustKqlNamedExpression { // Used in project, summarize aggregations, extend
  expression: ActualRustKqlExpression;
  alias: ActualRustKqlIdentifier | null; // `Option<Identifier>` in Rust
}

export interface ActualRustKqlSortClause {
  expression: ActualRustKqlExpression;
  sort_order?: "Asc" | "Desc"; // `Option<SortOrder>` in Rust
  nulls_first?: boolean | null; // `Option<bool>` in Rust (true for NULLS FIRST, false for NULLS LAST)
}

// Tabular Operators: Each is an object with a single key being the operator name (Rust enum style)
export type ActualRustKqlTabularOperator =
  | { Where: { predicate: ActualRustKqlExpression } }
  | { Project: { columns: ActualRustKqlNamedExpression[] } }
  | { Limit: { count: ActualRustKqlExpression } } // `Take` in KQL, `Limit` in irtimmer/rust-kql AST
  | { Summarize: { aggregations: ActualRustKqlNamedExpression[]; by_clauses: ActualRustKqlNamedExpression[] } }
  | { SortBy: { clauses: ActualRustKqlSortClause[] } } // `SortBy` in irtimmer/rust-kql AST
  | { Search: { search_term: ActualRustKqlExpression; columns: ActualRustKqlExpression[] | null } } // search_term likely Literal String
  | { Extend: { columns: ActualRustKqlNamedExpression[] } }
  | { Distinct: { columns: ActualRustKqlExpression[] } } // columns are expressions (usually Column or Path)
  | { Top: { count: ActualRustKqlExpression; by_expression: ActualRustKqlNamedExpression; sort_order?: "Asc" | "Desc"; with_others: ActualRustKqlExpression | null } };

export interface ActualRustKqlSource { // `source: Source` in irtimmer/rust-kql TabularExpression
    name: ActualRustKqlIdentifier;
    alias: ActualRustKqlIdentifier | null;
}

export type ActualRustKqlStatement = // We only care about TabularExpression for now
  | { TabularExpression: { source: ActualRustKqlSource; operations: ActualRustKqlTabularOperator[] } }
  | { Let: { name: ActualRustKqlIdentifier; expression: ActualRustKqlExpression } };

export interface ActualRustKqlQuery { // Top-level structure from `parse_query`
  statements: ActualRustKqlStatement[];
}

// --- Transformation Helper Functions ---

function extractActualLiteralValue(literalExpr: { Literal: ActualRustKqlLiteralValue }): string | number | boolean | null {
  const literalVal = literalExpr.Literal;
  if ("String" in literalVal) return literalVal.String;
  if ("Long" in literalVal) return literalVal.Long;
  if ("Real" in literalVal) return literalVal.Real;
  if ("Bool" in literalVal) return literalVal.Bool;
  if ("Datetime" in literalVal) return literalVal.Datetime;
  if ("Null" in literalVal) return null;
  if ("Timespan" in literalVal) return literalVal.Timespan;
  if ("Dynamic" in literalVal) return JSON.stringify(literalVal.Dynamic);
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
        if ("Literal" in accessor.Index.index) {
            const literalValue = extractActualLiteralValue({Literal: accessor.Index.index.Literal});
            currentPath += `.${literalValue}`;
        } else {
            console.warn("[ASTTransformer] Non-literal index in Path not fully supported for name extraction, using placeholder.");
            currentPath += `.[index_expr]`;
        }
      }
    }
    return currentPath;
  }
  console.warn("[ASTTransformer] Cannot extract simple field name/path from expression for general use:", JSON.stringify(expr).substring(0,100));
  throw new Error(`Unsupported expression type for field/path extraction: ${Object.keys(expr)[0]}`);
}

function mapActualRustKqlFuncToSql(kqlFuncName: ActualRustKqlFunctionName): string {
    const name = (typeof kqlFuncName === 'string' ? kqlFuncName : kqlFuncName.value).toLowerCase();
    const map: Record<string, string> = {
        "toupper": "UPPER", "tolower": "LOWER", "strcat": "CONCAT", "now": "NOW",
        "gethour": "EXTRACT(HOUR FROM", "datetime_part": "EXTRACT", "ago": "NOW() - INTERVAL"
    };
    return map[name] || name.toUpperCase();
}

function mapActualRustKqlBinaryOpToSqlOp(kqlOpName: ActualRustKqlBinaryOperator): string {
    const map: Record<string, string> = { "Add": "+", "Sub": "-", "Mul": "*", "Div": "/", "Mod": "%" };
    return map[kqlOpName] || kqlOpName; // Default if not an arithmetic op for extend
}

function transformActualRustExpressionToKqlExpressionValue(expr: ActualRustKqlExpression): KqlExpressionValue | null {
    if ("Column" in expr) {
        return { type: 'ColumnReference', columnName: expr.Column.name.value };
    }
    if ("Path" in expr) {
        return { type: 'ColumnReference', columnName: extractActualFieldNameOrPath(expr) };
    }
    if ("Literal" in expr) {
        return { type: 'Literal', value: extractActualLiteralValue({Literal: expr.Literal}) };
    }
    if ("FunctionCall" in expr) {
        const funcCall = expr.FunctionCall;
        const kqlFuncName = funcCall.name;
        const sqlFuncName = mapActualRustKqlFuncToSql(kqlFuncName);

        const argsSql = funcCall.args.map(arg => {
            const transformedArg = transformActualRustExpressionToKqlExpressionValue(arg);
            if (!transformedArg) throw new Error(`Failed to transform argument for ${sqlFuncName}`);
            if (transformedArg.type === 'ColumnReference') return `"${transformedArg.columnName}"`;
            if (transformedArg.type === 'Literal') return formatSqlValueForExpression(transformedArg.value);
            if (transformedArg.type === 'RawSqlExpression') return transformedArg.expressionString;
            return "NULL";
        });

        const funcNameStr = (typeof kqlFuncName === 'string' ? kqlFuncName : kqlFuncName.value).toLowerCase();
        if (funcNameStr === 'gethour') {
             return { type: 'RawSqlExpression', expressionString: `${sqlFuncName} ${argsSql[0]})` };
        }
        if (funcNameStr === 'datetime_part') {
             if (argsSql.length < 2) throw new Error("datetime_part expects at least 2 arguments");
             return { type: 'RawSqlExpression', expressionString: `${sqlFuncName}(${argsSql[0]} FROM ${argsSql[1]})` };
        }
        if (funcNameStr === 'ago') {
            if (argsSql.length === 1) {
                return { type: 'RawSqlExpression', expressionString: `${sqlFuncName} ${argsSql[0]}` };
            }
        }
        return { type: 'RawSqlExpression', expressionString: `${sqlFuncName}(${argsSql.join(', ')})` };
    }
    if ("BinaryExpression" in expr) {
        const be = expr.BinaryExpression;
        const leftVal = transformActualRustExpressionToKqlExpressionValue(be.left);
        const rightVal = transformActualRustExpressionToKqlExpressionValue(be.right);
        const opSql = mapActualRustKqlBinaryOpToSqlOp(be.op);

        if (leftVal && rightVal) {
            const leftStr = leftVal.type === 'RawSqlExpression' ? leftVal.expressionString : leftVal.type === 'ColumnReference' ? `"${leftVal.columnName}"` : String(leftVal.value);
            const rightStr = rightVal.type === 'RawSqlExpression' ? rightVal.expressionString : rightVal.type === 'ColumnReference' ? `"${rightVal.columnName}"` : String(rightVal.value);
            return { type: 'RawSqlExpression', expressionString: `(${leftStr} ${opSql} ${rightStr})`};
        }
    }
    console.warn("[ASTTransformer] Unsupported ActualRustKqlExpression type for KqlExpressionValue:", JSON.stringify(expr).substring(0,100));
    return null;
}

function formatSqlValueForExpression(value: string | number | boolean | null): string {
    if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value === null) return "NULL";
    return `'${String(value).replace(/'/g, "''")}'`;
}

function transformActualRustExpressionToConditionNode(expr: ActualRustKqlExpression): ConditionNode | null {
  if (expr.BinaryExpression) {
    const be = expr.BinaryExpression;
    const leftOperand = be.left;
    const rightOperand = be.right;

    if (be.op === 'And' || be.op === 'Or') { // Match exact Rust AST operator names
      const leftCondition = transformActualRustExpressionToConditionNode(leftOperand);
      const rightCondition = transformActualRustExpressionToConditionNode(rightOperand);
      if (!leftCondition || !rightCondition) return null;
      return {
        type: 'Logical',
        operator: be.op.toLowerCase() as LogicalOperator,
        conditions: [leftCondition, rightCondition],
      } as LogicalConditionNode;
    }

    const field = extractActualFieldNameOrPath(leftOperand);

    if (be.op === 'In' || be.op === 'InCs' || be.op === 'NotIn' || be.op === 'NotInCs') {
        if (!("ArrayLiteral" in rightOperand)) {
            console.error("[ASTTransformer] Expected ArrayLiteral for 'In'-like operator's right side, got:", JSON.stringify(rightOperand));
            return null;
        }
        const values = rightOperand.ArrayLiteral.Array.map(litVal => extractActualLiteralValue({Literal: litVal}));
        if (be.op === 'NotIn' || be.op === 'NotInCs') {
             console.warn(`[ASTTransformer] 'NotIn' operator functionality not fully implemented in target AST/SQL for '${field}'. Transforming as 'In' and negating would be complex.`);
             // For a full solution, our ConditionNode would need a 'negated' flag or a NotInConditionNode
        }
        return {
            type: 'In',
            field,
            values,
            caseSensitive: be.op === 'InCs' || be.op === 'NotInCs',
        } as InConditionNode;
    }
    if (be.op === 'MatchesRegex') {
        if (!("Literal" in rightOperand && ("String" in rightOperand.Literal))) { // Check for String in Literal
             console.error("[ASTTransformer] Expected String Literal for 'MatchesRegex' operator's right side, got:", JSON.stringify(rightOperand));
            return null;
        }
        return {
            type: 'MatchesRegex',
            field,
            regex: rightOperand.Literal.String,
        } as MatchesRegexConditionNode;
    }

    if (!("Literal" in rightOperand)) {
      console.error("[ASTTransformer] Expected Literal on the right side of op, got:", JSON.stringify(rightOperand));
      return null;
    }
    const value = extractActualLiteralValue({Literal: rightOperand.Literal});

    switch (be.op) {
      case 'Equal': return { type: 'Equals', field, value } as EqualityConditionNode;
      case 'GreaterThan': case 'LessThan': case 'GreaterThanOrEqual': case 'LessThanOrEqual': case 'NotEqual':
        if (value === null || (typeof value !== 'string' && typeof value !== 'number')) {
             console.error(`[ASTTransformer] Invalid value type for comparison operator ${be.op}:`, value); return null;
        }
        let opSymbol: ComparisonOperator = '==' ;
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
      case 'Contains': case 'StartsWith': case 'EndsWith':
        if (typeof value !== 'string') return null;
        return {
          type: 'StringOperation', field,
          operator: be.op.toLowerCase() as StringOperationType,
          value, caseSensitive: false,
        } as StringOperationConditionNode;
      case 'Has': case 'HasCs':
         if (typeof value !== 'string') return null;
         return {
            type: 'StringOperation', field,
            operator: 'contains', // Map KQL 'has' to our 'contains'
            value, caseSensitive: be.op === 'HasCs',
         } as StringOperationConditionNode;
      // TODO: Handle NotContains, NotStartsWith, NotEndsWith, HasPrefix, HasSuffix etc.
      default:
        console.error(`[ASTTransformer] Unsupported binary operator from Actual Rust AST: ${be.op}`);
        return null;
    }
  }
  console.error("[ASTTransformer] Expression type not directly usable as condition:", JSON.stringify(expr));
  return null;
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
  if ("Limit" in op) { // Renamed from Take to Limit to match irtimmer/rust-kql
    if (op.Limit.count && "Literal" in op.Limit.count && ("Long" in op.Limit.count.Literal || "Number" in op.Limit.count.Literal)) {
      const countVal = ("Long" in op.Limit.count.Literal) ? op.Limit.count.Literal.Long : (op.Limit.count.Literal as any).Number;
      return { type: 'Take', count: countVal } as TakeNode; // Still TakeNode in our AST
    }
    console.error("[ASTTransformer] Invalid Take/Limit operator structure from Actual Rust AST:", op);
    return null;
  }
  if ("Summarize" in op) {
    const summarizeOp = op.Summarize;
    const aggregations: Aggregation[] = summarizeOp.aggregations.map(namedAggExpr => {
      if (!("FunctionCall" in namedAggExpr.expression)) {
        throw new Error(`Expected FunctionCall in summarize aggregation, got ${Object.keys(namedAggExpr.expression)[0]}`);
      }
      const funcCall = namedAggExpr.expression.FunctionCall;
      let funcName = (typeof funcCall.name === 'string' ? funcCall.name : funcCall.name.value).toLowerCase();

      return {
        newColumnName: namedAggExpr.alias!.name.value,
        function: funcName as AggFunctionType,
        field: funcCall.args.length > 0 ? extractActualFieldNameOrPath(funcCall.args[0]) : undefined,
      };
    });
    const groupByFields: GroupByItem[] = summarizeOp.by_clauses.map(namedExpr => {
        const alias = namedExpr.alias!.name.value;
        const expr = namedExpr.expression;
        if ("FunctionCall" in expr && (typeof expr.FunctionCall.name === 'string' ? expr.FunctionCall.name : expr.FunctionCall.name.value).toLowerCase() === 'date_trunc') {
            const funcCall = expr.FunctionCall;
            if (funcCall.args.length !== 2 || !("Literal" in funcCall.args[0])) {
                throw new Error('Invalid date_trunc arguments in Actual Rust AST for group_by');
            }
            return {
                type: 'FunctionCall',
                functionName: 'date_trunc',
                arguments: [
                    extractActualLiteralValue({Literal: funcCall.args[0].Literal}) as string,
                    extractActualFieldNameOrPath(funcCall.args[1])
                ],
                alias: alias,
            } as GroupByExpression;
        } else if ("Column" in expr || "Path" in expr) {
            return alias; // Use the alias as the group by key (KQL: `by Title=ColumnName`)
        }
        throw new Error(`Unsupported groupBy expression structure from Actual Rust AST: ${JSON.stringify(expr)}`);
    });
    return { type: 'Summarize', aggregations, groupByFields } as SummarizeNode;
  }
  if ("SortBy" in op) {
    const sortOp = op.SortBy;
    const clauses: SortClause[] = sortOp.clauses.map(c => {
      const sortField = extractActualFieldNameOrPath(c.expression);
      const order = c.sort_order?.toLowerCase() as SortOrder | undefined;
      let nulls: NullsOrder | undefined = undefined;
      if (c.nulls_first === true) nulls = 'first';
      else if (c.nulls_first === false) nulls = 'last';
      return { field: sortField, order, nulls };
    });
    return { type: 'Sort', clauses } as SortNode;
  }
  if ("Search" in op) {
      const searchOp = op.Search;
      // Ensure search_term is Literal String
      if (!("Literal" in searchOp.search_term && "String" in searchOp.search_term.Literal)) {
          console.error("[ASTTransformer] Search term must be a string literal."); return null;
      }
      const searchTerm = searchOp.search_term.Literal.String;
      const columnsToSearch = searchOp.columns ? searchOp.columns.map(c => c.Column.name.value) : null;
      return { type: 'Search', searchTerm, columns: columnsToSearch } as SearchNode;
  }
  if ("Extend" in op) {
      const extendOp = op.Extend;
      const newColumns: ExtendedColumn[] = extendOp.columns.map(namedExpr => {
          const exprValue = transformActualRustExpressionToKqlExpressionValue(namedExpr.expression);
          if (!exprValue) {
              throw new Error(`Failed to transform expression for extend column: ${namedExpr.alias?.name.value}`);
          }
          return {
              name: namedExpr.alias!.name.value,
              expression: exprValue
          };
      });
      return { type: 'Extend', newColumns } as ExtendNode;
  }
  if ("Distinct" in op) {
      const distinctOp = op.Distinct;
      const columns = distinctOp.columns.map(expr => extractActualFieldNameOrPath(expr));
      return { type: 'Distinct', columns } as DistinctNode;
  }
  if ("Top" in op) {
      const topOp = op.Top;
      if (!("Literal" in topOp.count) || !(("Long" in topOp.count.Literal) || ("Number" in topOp.count.Literal))) {
          console.error("[ASTTransformer] Top count must be a long/number literal."); return null;
      }
      const count = ("Long"in topOp.count.Literal) ? topOp.count.Literal.Long : (topOp.count.Literal as any).Number;
      const byExpressionField = topOp.by_expression.alias?.name.value || extractActualFieldNameOrPath(topOp.by_expression.expression);
      const order = topOp.sort_order?.toLowerCase() as SortOrder || 'desc';
      let withOthers: boolean | undefined = undefined;
      if (topOp.with_others && "Literal" in topOp.with_others && "Bool" in topOp.with_others.Literal) {
          withOthers = topOp.with_others.Literal.Bool;
      }
      return { type: 'Top', count, byField: byExpressionField, order, withOthers } as TopNode;
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
    const typedRustAstSource = tabularExpr.source as ActualRustKqlSource;
    const typedRustAstOperations = tabularExpr.operations as ActualRustKqlTabularOperator[];

    const operations: OperationNode[] = [];
    for (const op of typedRustAstOperations) {
      const transformedOp = transformActualRustOperator(op);
      if (transformedOp) {
        operations.push(transformedOp);
      } else {
        console.warn(`[ASTTransformer] Failed to transform an operator, skipping it:`, op);
      }
    }

    return {
      type: 'Query',
      source: typedRustAstSource.name.value,
      operations: operations,
    };
  } catch (error: any) {
    console.error("[ASTTransformer] Critical error transforming Actual Rust AST to QueryNode:", error.message, error.stack);
    return null;
  }
}
