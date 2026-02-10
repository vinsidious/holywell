import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL INSERT Target Alias', () => {
  it('parses INSERT INTO target aliases declared with AS', () => {
    const sql = "INSERT INTO distributors AS d (did, dname) VALUES (8, 'Anvil Distribution');";
    const recoveries: string[] = [];

    expect(() =>
      parse(sql, {
        recover: false,
        onRecover: err => recoveries.push(err.message),
      })
    ).not.toThrow();
    expect(recoveries).toEqual([]);

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('INSERT INTO distributors AS d (did, dname)');
    expect(out).toContain("VALUES (8, 'Anvil Distribution');");
  });
});
