import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('T-SQL SELECT OPTION hints', () => {
  it('parses and formats SELECT statements that include OPTION query hints', () => {
    const sql = 'SELECT * FROM t WHERE x = 1 OPTION (RECOMPILE, MAXDOP 1);';

    expect(() => parse(sql, { recover: false, dialect: 'tsql' })).not.toThrow();

    const recoveries: string[] = [];
    const out = formatSQL(sql, {
      dialect: 'tsql',
      onRecover: err => recoveries.push(err.message),
    });

    expect(recoveries).toEqual([]);
    expect(out).toContain('OPTION (RECOMPILE, MAXDOP 1);');
    expect(() => parse(out, { recover: false, dialect: 'tsql' })).not.toThrow();
  });
});
