import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('CREATE TEMPORARY VIEW VALUES alias parsing', () => {
  it('parses and formats VALUES aliases with column lists in CREATE OR REPLACE TEMPORARY VIEW', () => {
    const sql = `CREATE OR REPLACE TEMPORARY VIEW t1 AS
VALUES (1, 'a'), (2, 'b') tbl(c1, c2);`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('CREATE OR REPLACE TEMPORARY VIEW t1 AS');
    expect(out).toMatch(/VALUES \(1, 'a'\),\n\s+\(2, 'b'\) tbl\s*\(c1, c2\);/);
  });
});
