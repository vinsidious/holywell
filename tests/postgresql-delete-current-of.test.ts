import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('PostgreSQL DELETE CURRENT OF', () => {
  it('parses cursor-positioned DELETE statements', () => {
    const sql = 'DELETE FROM tasks WHERE CURRENT OF c_tasks;';
    const recoveries: string[] = [];

    expect(() =>
      parse(sql, {
        recover: false,
        onRecover: err => recoveries.push(err.message),
      })
    ).not.toThrow();
    expect(recoveries).toEqual([]);

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('DELETE');
    expect(out).toContain('FROM tasks');
    expect(out).toContain('WHERE CURRENT OF c_tasks;');
  });
});
