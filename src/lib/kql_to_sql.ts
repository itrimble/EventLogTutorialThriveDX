// src/lib/kql_to_sql.ts
import {
  QueryNode, OperationNode, WhereNode, ProjectNode, TakeNode, ConditionNode,
  SummarizeNode, Aggregation, AggFunctionType, GroupByItem, GroupByExpression,
  SortNode, SortClause,
  EqualityConditionNode, ComparisonConditionNode, ComparisonOperator,
  StringOperationConditionNode, StringOperationType,
  LogicalConditionNode, LogicalOperator
} from './kql_ast';

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

// Helper to format SQL literal values based on JS type
function formatSqlValue(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return `'${escapeSqlString(value)}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  // Fallback for other types, though our AST currently only supports these
  return `'${escapeSqlString(String(value))}'`;
}

// Helper to format field names for SQL.
// Casting is now primarily handled in transpileConditionNode or for aggregations.
function getFieldSqlAccessor(field: GroupByItem): string {
  if (typeof field === 'string') {
    if (field.startsWith('parsed_fields.')) {
      const actualField = field.substring('parsed_fields.'.length);
      return `parsed_fields->>'${actualField}'`;
    }
    return `"${field}"`; // Quote direct column names for safety
  } else if (field.type === 'FunctionCall' && field.functionName === 'date_trunc') {
    const funcName = field.functionName.toUpperCase();
    const arg1 = formatSqlValue(field.arguments[0]); // e.g., 'hour'
    const arg2 = getFieldSqlAccessor(field.arguments[1]); // e.g., "timestamp" (the column)
    return `${funcName}(${arg1}, ${arg2})`;
  }
  throw new Error(`Unsupported field type in getFieldSqlAccessor: ${JSON.stringify(field)}`);
}

// Helper to get the field name for SELECT clause, including alias for functions/parsed_fields
function getSelectFieldSql(field: GroupByItem): string {
    if (typeof field === 'string') {
        if (field.startsWith('parsed_fields.')) {
            return `${getFieldSqlAccessor(field)} AS "${field}"`;
        }
        return getFieldSqlAccessor(field); // Direct field, accessor is already quoted
    } else if (field.type === 'FunctionCall' && field.functionName === 'date_trunc') {
        return `${getFieldSqlAccessor(field)} AS "${field.alias}"`;
    }
    throw new Error(`Unsupported field type in getSelectFieldSql: ${JSON.stringify(field)}`);
}


function transpileConditionNode(condition: ConditionNode): string {
  let fieldSql: string;
  let valueSql: string;

  switch (condition.type) {
    case 'Equals':
      const eqNode = condition as EqualityConditionNode;
      fieldSql = getFieldSqlAccessor(eqNode.field);

      if (eqNode.field.startsWith('parsed_fields.')) {
        // All parsed_fields are accessed as text (->>)
        // So, compare with the string representation of the value from KQL.
        valueSql = formatSqlValue(String(eqNode.value));
      } else {
        // Direct column, use the value's JS type to format for SQL
        valueSql = formatSqlValue(eqNode.value);
      }
      return `${fieldSql} = ${valueSql}`;

    case 'Compare':
      const compNode = condition as ComparisonConditionNode;
      fieldSql = getFieldSqlAccessor(compNode.field);

      if (compNode.field.startsWith('parsed_fields.')) {
        // If comparing a parsed_field, and KQL value is a number, cast field to numeric
        if (typeof compNode.value === 'number') {
          fieldSql = `(${fieldSql})::numeric`;
          valueSql = formatSqlValue(compNode.value); // number
        } else {
          // Comparing parsed_field (text) with a string from KQL, standard text comparison
          valueSql = formatSqlValue(compNode.value); // string
        }
      } else {
        // Direct column, format value based on its JS type
        valueSql = formatSqlValue(compNode.value);
      }
      return `${fieldSql} ${compNode.operator} ${valueSql}`;

    case 'StringOperation':
      const strOpNode = condition as StringOperationConditionNode;
      fieldSql = getFieldSqlAccessor(strOpNode.field);
      // Value for LIKE/ILIKE should always be treated as a string pattern
      const likeValue = strOpNode.value;
      const likeOp = strOpNode.caseSensitive === true ? 'LIKE' : 'ILIKE';

      switch (strOpNode.operator) {
        case 'contains':
          return `${fieldSql} ${likeOp} '%${escapeSqlString(likeValue)}%'`;
        case 'startswith':
          return `${fieldSql} ${likeOp} '${escapeSqlString(likeValue)}%'`;
        case 'endswith':
          return `${fieldSql} ${likeOp} '%${escapeSqlString(likeValue)}'`;
        default:
          throw new Error(`Unsupported string operator: ${strOpNode.operator}`);
      }

    case 'Logical':
      const logNode = condition as LogicalConditionNode;
      const conditionsSql = logNode.conditions.map(c => `(${transpileConditionNode(c)})`).join(` ${logNode.operator.toUpperCase()} `);
      return conditionsSql;

    default:
      // @ts-ignore
      throw new Error(`Unsupported condition node type: ${condition.type}`);
  }
}


export function transpileAstToSql(ast: QueryNode): string {
  if (ast.type !== 'Query' || !ast.source) {
    throw new Error('Invalid AST: Must be a QueryNode with a source table.');
  }

  let selectFieldsSqlParts: string[] = ['*'];
  let whereClause = '';
  let groupByClause = '';
  let orderByClause = '';
  let limitClause = '';

  let hasSummarize = false;
  // Store how group by fields should appear in SELECT (e.g. with alias) and GROUP BY (raw accessor/function)
  let summarizeSelectSQL: string[] = [];
  let summarizeGroupBySQL: string[] = [];

  for (const operation of ast.operations) {
    switch (operation.type) {
      case 'Project':
        const projectNode = operation as ProjectNode;
        if (!hasSummarize && projectNode.fields && projectNode.fields.length > 0) {
          selectFieldsSqlParts = projectNode.fields.map(f => getSelectFieldSql(f as GroupByItem)); // Cast needed if Project fields could also be GroupByExpression
        } else if (hasSummarize) {
            console.warn("[KQL Transpiler] Project after summarize is not fully implemented. Current selection from summarize will be used.");
            // A full implementation would re-project from the results of the summarize.
            // For now, the selectFieldsSqlParts already contains the summarize output.
        }
        break;

      case 'Where':
        const whereNode = operation as WhereNode;
        const conditionSql = transpileConditionNode(whereNode.condition);
        if (whereClause === '') {
          whereClause = `WHERE ${conditionSql}`;
        } else {
          whereClause += ` AND ${conditionSql}`;
        }
        break;

      case 'Take':
        const takeNode = operation as TakeNode;
        if (takeNode.count > 0) {
          limitClause = `LIMIT ${takeNode.count}`;
        }
        break;

      case 'Summarize':
        hasSummarize = true;
        const summarizeNode = operation as SummarizeNode;
        summarizeSelectSQL = [];
        summarizeGroupBySQL = [];

        summarizeNode.groupByFields.forEach(gf => {
          summarizeSelectSQL.push(getSelectFieldSql(gf));
          summarizeGroupBySQL.push(getFieldSqlAccessor(gf));
        });

        selectFieldsSqlParts = [...summarizeSelectSQL]; // Start SELECT with group by fields (aliased if functions)

        summarizeNode.aggregations.forEach(agg => {
          let aggSqlFragments = '';
          let fieldForAgg = '';
          if (agg.field) {
            // For aggregations like min, max, avg, sum, if the field is from parsed_fields, cast it to numeric.
            // For dcount, no cast on the field itself.
            const fieldAccessor = getFieldSqlAccessor(agg.field);
            if ((agg.function === 'min' || agg.function === 'max' || agg.function === 'avg' || agg.function === 'sum') && agg.field.startsWith('parsed_fields.')) {
              fieldForAgg = `(${fieldAccessor})::numeric`;
            } else {
              fieldForAgg = fieldAccessor;
            }
          }

          switch (agg.function) {
            case 'count': aggSqlFragments = `COUNT(*)`; break;
            case 'dcount':
              if (!agg.field) throw new Error("dcount requires a field name.");
              aggSqlFragments = `COUNT(DISTINCT ${fieldForAgg})`; break;
            case 'min':
              if (!agg.field) throw new Error("min requires a field name.");
              aggSqlFragments = `MIN(${fieldForAgg})`; break;
            case 'max':
              if (!agg.field) throw new Error("max requires a field name.");
              aggSqlFragments = `MAX(${fieldForAgg})`; break;
            case 'avg':
              if (!agg.field) throw new Error("avg requires a field name.");
              aggSqlFragments = `AVG(${fieldForAgg})`; break;
            case 'sum':
              if (!agg.field) throw new Error("sum requires a field name.");
              aggSqlFragments = `SUM(${fieldForAgg})`; break;
            default: throw new Error(`Unsupported aggregation function: ${agg.function}`);
          }
          selectFieldsSqlParts.push(`${aggSqlFragments} AS "${agg.newColumnName}"`);
        });

        if (summarizeNode.groupByFields.length > 0) {
          groupByClause = `GROUP BY ${summarizeGroupBySQL.join(', ')}`;
        }
        break;

      case 'Sort':
        const sortNode = operation as SortNode;
        if (sortNode.clauses && sortNode.clauses.length > 0) {
          orderByClause = 'ORDER BY ' + sortNode.clauses.map(c => {
            let fieldToSortBy = `"${c.field}"`; // Default to sorting by alias (from summarize/project) or quoted field name

            // Check if sorting by a direct column not otherwise aliased by summarize's groupBy (which getSelectFieldSql handles for select)
            // This logic is tricky because 'c.field' could be an aggregation alias, a groupBy alias, or a direct column.
            // For this PoC, we assume if it's not an aggregation alias, it's either a direct column or a groupBy alias.
            // Aggregation aliases are already quoted. GroupBy aliases (from date_trunc) are quoted. Direct columns need quoting.
            // The simplest is to always quote the sort field if it's not a complex expression.
            // If c.field refers to an alias generated by summarize (either an aggregation or a GroupByExpression alias), it's already correct.
            // If c.field refers to a direct table column or a parsed_field that wasn't part of summarize groupBy, use getFieldSqlAccessor.

            const isAggregationAlias = summarizeNode?.aggregations.some(agg => agg.newColumnName === c.field);
            const isGroupByAlias = summarizeNode?.groupByFields.some(gf => typeof gf !== 'string' && gf.alias === c.field);

            if (!isAggregationAlias && !isGroupByAlias) {
                fieldToSortBy = getFieldSqlAccessor(c.field);
            }

            let clauseSql = fieldToSortBy;
            if (c.order) clauseSql += ` ${c.order.toUpperCase()}`;
            if (c.nulls) clauseSql += ` NULLS ${c.nulls.toUpperCase()}`;
            return clauseSql;
          }).join(', ');
        }
        break;

      default:
        // @ts-ignore
        throw new Error(`Unsupported KQL operation: ${operation.type}`);
    }
  }

  const selectClauseSql = `SELECT ${selectFieldsSqlParts.join(', ')}`;
  return `${selectClauseSql} FROM "${ast.source}"${whereClause ? ' ' + whereClause : ''}${groupByClause ? ' ' + groupByClause : ''}${orderByClause ? ' ' + orderByClause : ''}${limitClause ? ' ' + limitClause : ''};`;
}
