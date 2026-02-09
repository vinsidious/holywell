import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('JSON_TABLE and LISTAGG WITHIN GROUP support', () => {
  it('parses JSON_TABLE column path clauses', () => {
    const sql = "SELECT * FROM JSON_TABLE(data, '$' COLUMNS (val INTEGER PATH '$.val')) t;";
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out.toUpperCase()).toContain("JSON_TABLE(DATA, '$' COLUMNS");
    expect(out.toUpperCase()).toContain("PATH '$.VAL')");
  });

  it('parses LISTAGG WITHIN GROUP ordered aggregates', () => {
    const sql = "SELECT LISTAGG(name, ', ') WITHIN GROUP (ORDER BY id) FROM t;";
    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out.toUpperCase()).toContain("LISTAGG(NAME, ', ') WITHIN GROUP (ORDER BY ID)");
  });
});
