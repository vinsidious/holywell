import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL recursive CTE values unions', () => {
  it('parses and formats recursive CTE bodies that start with VALUES and continue with UNION ALL', () => {
    const sql = `WITH RECURSIVE t(n) AS (
    VALUES (1)
    UNION ALL
    SELECT n + 1 FROM t WHERE n < 10
)
SELECT * FROM t;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toMatch(/WITH RECURSIVE t\s*\(n\)\s+AS\s+\(/);
    expect(out).toMatch(/VALUES\s*\n\s*\(1\)/);
    expect(out).toContain('UNION ALL');
    expect(out).toContain('SELECT n + 1');
  });
});
