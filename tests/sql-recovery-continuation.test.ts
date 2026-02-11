import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Recovery continuation after unparseable statements', () => {
  it('keeps formatting statements that come after a recovered parse failure', () => {
    const sql = `SELECT (1;
SELECT 2;
SELECT 3;`;

    let recoveries = 0;
    const out = formatSQL(sql, {
      recover: true,
      onRecover: () => recoveries++,
    });

    expect(recoveries).toBeGreaterThan(0);
    expect(out).toContain('SELECT 2;');
    expect(out).toContain('SELECT 3;');
    expect(out.indexOf('SELECT 2;')).toBeGreaterThan(out.indexOf('SELECT (1;'));
    expect(out.indexOf('SELECT 3;')).toBeGreaterThan(out.indexOf('SELECT 2;'));
  });
});
