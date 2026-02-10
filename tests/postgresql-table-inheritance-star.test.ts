import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL inherited-table selector', () => {
  it('parses table-name star selectors in FROM clauses', () => {
    const sql = 'SELECT p.name, p.age FROM person* p;';
    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql);
    expect(out).toContain('FROM person* AS p;');
  });
});
