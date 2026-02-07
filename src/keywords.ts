// SQL reserved keywords for recognition and uppercasing.
//
// Design: KEYWORD_LIST contains SQL reserved words and clause keywords.
// FUNCTION_KEYWORD_LIST contains keywords that act as function names (followed
// by parens). Some words could appear in both lists; to avoid duplication, each
// word appears in exactly one list. KEYWORDS is the union of both sets, used by
// the tokenizer to recognize all keywords.
const KEYWORD_LIST = [
  'ABSOLUTE', 'ACTION', 'ADD', 'ALTER', 'AND', 'ARRAY', 'AS', 'ASC',
  'BERNOULLI', 'BETWEEN', 'BIGINT', 'BINARY', 'BIT', 'BLOB', 'BOOLEAN', 'BOTH', 'BY',
  'CASCADE', 'CASE', 'CHAR', 'CHARACTER', 'CHECK', 'CLOB', 'CLOSE',
  'COLUMN', 'COMMIT', 'CONCURRENTLY', 'CONFLICT', 'CONSTRAINT', 'CREATE', 'CROSS', 'CUBE', 'CURRENT',
  'CURRENT_DATE', 'CURRENT_ROW', 'CURRENT_TIME', 'CURRENT_TIMESTAMP',
  'CURRENT_USER', 'CURSOR',
  'DATA', 'DATABASE', 'DATE', 'DECIMAL', 'DECLARE', 'DEFAULT', 'DELETE',
  'DESC', 'DISTINCT', 'DO', 'DOUBLE', 'DROP',
  'ELSE', 'END', 'ESCAPE', 'EXCEPT', 'EXCLUDE', 'EXCLUDED', 'EXECUTE',
  'FALSE', 'FETCH', 'FILTER', 'FLOAT', 'FOLLOWING', 'FOR', 'FOREIGN', 'FROM', 'FULL',
  'FUNCTION',
  'GRANT', 'GROUP',
  'HAVING',
  'IDENTITY', 'IF', 'ILIKE', 'IN', 'INDEX', 'INNER', 'INSERT', 'INT', 'INTEGER', 'INTERSECT',
  'INTERVAL', 'INTO', 'IS',
  'JOIN', 'JSON', 'JSONB',
  'KEY',
  'LATERAL', 'LEADING', 'LEFT', 'LIKE', 'LIMIT',
  'MATCHED', 'MATERIALIZED', 'MERGE',
  'NATIONAL', 'NATURAL', 'NCHAR', 'NEXT', 'NO', 'NOT', 'NULL', 'NUMERIC',
  'OF', 'OFFSET', 'ON', 'ONLY', 'OPEN', 'OR', 'ORDER', 'OUTER', 'OVER', 'OVERLAY',
  'PARTITION', 'PLACING', 'PRECEDING', 'PRECISION', 'PRIMARY', 'PROCEDURE',
  'RANGE', 'REAL', 'RECURSIVE', 'REFERENCES', 'REPEATABLE', 'RESTART', 'RETURNING', 'REVOKE', 'RIGHT', 'ROLLBACK', 'ROLLUP',
  'ROWS',
  'SCHEMA', 'SELECT', 'SERIAL', 'SET', 'SHARE', 'SIMILAR', 'SKIP', 'SMALLINT', 'SOME',
  'TABLE', 'TABLESAMPLE', 'TEXT', 'THEN', 'TIES', 'TIME', 'TIMESTAMP', 'TO', 'TRAILING', 'TRIGGER',
  'TRUE', 'TRUNCATE',
  'UNBOUNDED', 'UNION', 'UNIQUE', 'UPDATE', 'USER', 'USING',
  'VALUES', 'VARCHAR', 'VARYING', 'VIEW',
  'WHEN', 'WHERE', 'WINDOW', 'WITH', 'WITHIN', 'WITHOUT',
  'NOWAIT', 'LOCKED',
] as const;

// Function-like keywords (followed by parens) -- uppercased but not clause keywords.
const FUNCTION_KEYWORD_LIST = [
  'ABS', 'AGE', 'ALL', 'ANY', 'ARRAY_AGG', 'ARRAY_LENGTH', 'AVG', 'CAST', 'CEIL', 'CEILING',
  'COALESCE', 'CONCAT', 'COUNT', 'CUME_DIST', 'CURRVAL', 'DATE_PART', 'DATE_TRUNC',
  'DAY', 'DENSE_RANK', 'EXISTS', 'EXTRACT', 'FIRST_VALUE', 'FLOOR', 'GENERATE_SERIES',
  'GREATEST', 'GROUPING', 'HOUR', 'JSONB_AGG', 'JSONB_ARRAY_ELEMENTS', 'JSONB_BUILD_OBJECT',
  'JSONB_EACH', 'JSONB_PATH_QUERY_ARRAY', 'LAG', 'LAST_VALUE', 'LEAD', 'LEAST',
  'LENGTH', 'LOWER', 'MAX', 'MIN', 'MINUTE', 'MODE', 'MONTH', 'NEXTVAL', 'NOTHING',
  'NTH_VALUE', 'NTILE', 'NOW', 'NULLIF', 'PERCENT_RANK', 'PERCENTILE_CONT', 'PERCENTILE_DISC',
  'POSITION', 'RANK', 'REPLACE', 'ROW', 'ROW_NUMBER', 'ROUND', 'SECOND', 'SETVAL',
  'SIGN', 'STRING_AGG', 'SUBSTRING', 'SUM', 'TO_CHAR', 'TRIM', 'UNNEST', 'UPPER', 'YEAR',
] as const;

// KEYWORDS is the union of both lists, used by the tokenizer for recognition.
export const KEYWORDS = new Set<string>([...KEYWORD_LIST, ...FUNCTION_KEYWORD_LIST]);

// Keywords that are function-like (followed by parens) -- should be uppercased
// but not treated as clause keywords.
export const FUNCTION_KEYWORDS = new Set<string>(FUNCTION_KEYWORD_LIST);

export function isKeyword(word: string): boolean {
  return KEYWORDS.has(word.toUpperCase());
}
