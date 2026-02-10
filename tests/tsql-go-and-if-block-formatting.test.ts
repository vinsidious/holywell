import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

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

describe('T-SQL ELSE IF control-flow chains', () => {
  it('keeps ELSE IF blocks in the same statement in strict parsing mode', () => {
    const sql = `IF(@bangla>=80 AND @bangla<=100)
BEGIN
    SET @banglagpa =5
END

else if(@bangla>=70 and @bangla<=79)
begin
set @banglagpa =4
end`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('normalizes keyword casing across ELSE IF blocks', () => {
    const sql = `IF(@bangla>=80 AND @bangla<=100)
BEGIN
    SET @banglagpa =5
END

else if(@bangla>=70 and @bangla<=79)
begin
set @banglagpa =4
end`;

    const out = formatSQL(sql);
    expect(out).toContain('ELSE IF(@bangla>=70 AND @bangla<=79)');
    expect(out).toContain('\nBEGIN\nSET @banglagpa =4\nEND');
    expect(out).not.toContain('else if');
    expect(out).not.toContain('\nbegin\n');
  });
});
