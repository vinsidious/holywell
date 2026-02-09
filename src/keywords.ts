// SQL reserved keywords for recognition and uppercasing.
//
// Design: KEYWORD_LIST contains SQL reserved words and clause keywords.
// FUNCTION_KEYWORD_LIST contains keywords that act as function names (followed
// by parens). Some words could appear in both lists; to avoid duplication, each
// word appears in exactly one list. KEYWORDS is the union of both sets, used by
// the tokenizer to recognize all keywords.
const KEYWORD_LIST = [
  'ABSOLUTE', 'ACTION', 'ADD', 'ALTER', 'ALWAYS', 'AND', 'APPLY', 'ARRAY', 'AS', 'ASC',
  'BEGIN', 'BERNOULLI', 'BETWEEN', 'BIGINT', 'BIGSERIAL', 'BINARY', 'BIT', 'BLOB', 'BOOL', 'BOOLEAN', 'BOTH', 'BYTEA', 'BY',
  'CASCADE', 'CASE', 'CHAR', 'CHARACTER', 'CHARSET', 'CHECK', 'CIDR', 'CLOB', 'CLOSE',
  'COLUMN', 'COLUMNS', 'COMMIT', 'CONCURRENTLY', 'CONFLICT', 'CONSTRAINT', 'CREATE', 'CROSS', 'CUBE', 'CURRENT',
  'CURRENT_DATE', 'CURRENT_ROW', 'CURRENT_TIME', 'CURRENT_TIMESTAMP',
  'CURRENT_USER', 'CURSOR',
  'DATA', 'DATABASE', 'DATE', 'DATETIME', 'DECIMAL', 'DECLARE', 'DEFAULT', 'DELETE', 'DOMAIN',
  'DESC', 'DISTINCT', 'DO', 'DOUBLE', 'DROP',
  'ELSE', 'END', 'ENGINE', 'ESCAPE', 'EXCEPT', 'EXCLUDE', 'EXCLUDED', 'EXECUTE', 'EXTENSION',
  'FALSE', 'FETCH', 'FILTER', 'FLOAT', 'FLOAT4', 'FLOAT8', 'FOLLOWING', 'FOR', 'FOREIGN', 'FROM', 'FULL',
  'FUNCTION',
  'GENERATED', 'GO', 'GRANT', 'GROUP',
  'HAVING',
  'IDENTITY', 'IF', 'ILIKE', 'IN', 'INET', 'INDEX', 'INNER', 'INSERT', 'INT', 'INT2', 'INT4', 'INT8', 'INTEGER', 'INTERSECT',
  'INTERVAL', 'INTO', 'IS',
  'JOIN', 'JSON', 'JSONB',
  'KEY',
  'LATERAL', 'LEADING', 'LEFT', 'LIKE', 'LIMIT',
  'MACADDR', 'MATCHED', 'MATERIALIZED', 'MERGE', 'MONEY',
  'MEDIUMTEXT',
  'NATIONAL', 'NATURAL', 'NCHAR', 'NEXT', 'NO', 'NOT', 'NULL', 'NUMERIC',
  'OF', 'OFFSET', 'ON', 'ONLY', 'OPEN', 'OR', 'ORDER', 'OUTER', 'OVER', 'OVERLAY',
  'PARTITION', 'PIVOT', 'PLACING', 'PRECEDING', 'PRECISION', 'PRIMARY', 'PROCEDURE',
  'PUBLICATION',
  'RANGE', 'REAL', 'RECURSIVE', 'REFERENCES', 'RELEASE', 'REPEATABLE', 'RESTART', 'RETURN', 'RETURNING', 'RETURNS', 'REVOKE', 'RIGHT', 'ROLLBACK', 'ROLLUP',
  'ROLE',
  'ROWS',
  'SAVEPOINT', 'SCHEMA', 'SELECT', 'SERIAL', 'SET', 'SHARE', 'SHOW', 'SIMILAR', 'SKIP', 'SMALLINT', 'SOME',
  'SEQUENCE',
  'START',
  'STORED',
  'STRAIGHT_JOIN',
  'TABLE', 'TABLESAMPLE', 'TEMPORARY', 'TEXT', 'THEN', 'TIES', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'TINYINT', 'TINYTEXT', 'TO', 'TOP', 'TRAILING', 'TRANSACTION', 'TRIGGER', 'TYPE',
  'TRUE', 'TRUNCATE', 'TSQUERY', 'TSVECTOR',
  'UNBOUNDED', 'UNION', 'UNIQUE', 'UNPIVOT', 'UNSIGNED', 'UPDATE', 'USE', 'USAGE', 'USER', 'USING', 'UUID',
  'VALUE', 'VALUES', 'VARCHAR', 'VARYING', 'VIEW',
  'WHEN', 'WHERE', 'WINDOW', 'WITH', 'WITHIN', 'WITHOUT', 'ZONE',
  'LONGTEXT',
  'NOWAIT', 'LOCKED',
  'ENUM',
] as const;

// Function-like keywords (followed by parens) -- uppercased but not clause keywords.
const FUNCTION_KEYWORD_LIST = [
  'ABS', 'AGE', 'ALL', 'ANY', 'ARRAY_AGG', 'ARRAY_LENGTH', 'AVG', 'CAST', 'CEIL', 'CEILING',
  'COALESCE', 'CONCAT', 'COUNT', 'CUME_DIST', 'CURRVAL', 'DATE_PART', 'DATE_TRUNC',
  'CURDATE', 'CURTIME', 'DAY', 'DAYOFWEEK', 'DATE_FORMAT', 'DENSE_RANK', 'EXISTS', 'EXTRACT', 'FIRST_VALUE', 'FLOOR',
  'GREATEST', 'GROUP_CONCAT', 'GROUPING', 'HOUR', 'JSONB_AGG', 'JSONB_ARRAY_ELEMENTS', 'JSONB_BUILD_OBJECT',
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
