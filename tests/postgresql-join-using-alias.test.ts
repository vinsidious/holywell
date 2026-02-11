import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL JOIN USING output aliases', () => {
  it('parses and formats aliases attached after USING clauses', () => {
    const sql = "SELECT * FROM t1 JOIN t2 USING (id) AS x WHERE x.name = 'test';";

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('USING (id) AS x');
    expect(out).toContain("WHERE x.name = 'test';");
  });
});
