import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('SQLite numbered positional parameters', () => {
  it('parses and formats ?NNN parameter placeholders', () => {
    const sql = 'SELECT ?1, ?2;';
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out.trim()).toBe('SELECT ?1, ?2;');
  });
});
