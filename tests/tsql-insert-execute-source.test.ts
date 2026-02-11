import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('T-SQL INSERT EXECUTE source statements', () => {
  it('parses insert into table variable execute statements in strict mode', () => {
    const sql = "insert into @tf execute('DBCC TRACESTATUS(-1)');";
    expect(() => parse(sql, { recover: false, dialect: 'tsql' })).not.toThrow();
  });

  it('formats insert execute without introducing aliases', () => {
    const sql = "insert into @tf execute('DBCC TRACESTATUS(-1)');";
    const out = formatSQL(sql, { dialect: 'tsql' });

    expect(out.toUpperCase()).toContain('INSERT INTO @TF EXECUTE');
    expect(out).toContain("'DBCC TRACESTATUS(-1)'");
    expect(out.toUpperCase()).not.toContain(' AS EXECUTE');
  });
});
