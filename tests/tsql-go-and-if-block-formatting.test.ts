import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('T-SQL GO separators and IF blocks', () => {
  it('keeps GO as a standalone batch separator after CREATE INDEX ON', () => {
    const sql = `CREATE INDEX idx_test ON actor(last_name)
GO

SELECT 1
GO`;

    const out = formatSQL(sql);
    expect(out).toContain('ON actor (last_name)');
    expect(out).toMatch(/\nGO\n/);
    expect(out).toMatch(/\nSELECT 1;\n/);
    expect(out).not.toContain('GO SELECT 1 GO');
  });

  it('formats statements inside IF BEGIN END blocks', () => {
    const sql = `IF EXISTS (SELECT name FROM sys.tables WHERE name = N'foo')
BEGIN
\tdrop table foo;
\tdrop table bar;
END`;

    const out = formatSQL(sql);
    expect(out).toContain('IF EXISTS (SELECT name FROM sys.tables WHERE name = N\'foo\')');
    expect(out).toContain('DROP TABLE foo;');
    expect(out).toContain('DROP TABLE bar;');
  });
});

