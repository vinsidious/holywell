import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL ALTER TYPE and COPY stdin behavior', () => {
  it('keeps ALTER TYPE ADD VALUE without inserting COLUMN', () => {
    const sql = "ALTER TYPE meal_type ADD VALUE 'POULTRY';";
    const out = formatSQL(sql);
    expect(out).toContain("ADD VALUE 'POULTRY'");
    expect(out).not.toContain('ADD COLUMN VALUE');
  });

  it('preserves COPY FROM stdin rows containing apostrophes', () => {
    const sql = "COPY t (id, name) FROM stdin;\n1\tO'Neil\n\\.\nSELECT 1;";
    const out = formatSQL(sql);
    expect(out).toContain('COPY t (id, name) FROM stdin;');
    expect(out).toContain("1\tO'Neil");
    expect(out).toContain('\\.');
    expect(out).toContain('SELECT 1;');
  });

  it('parses ALTER TYPE ADD VALUE in strict mode', () => {
    expect(() => parse("ALTER TYPE meal_type ADD VALUE 'POULTRY';", { recover: false })).not.toThrow();
  });
});
