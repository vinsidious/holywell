import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('Oracle ALTER TABLE ADD keyword preservation', () => {
  it('keeps Oracle single-column ADD actions without injecting COLUMN', () => {
    const sql = `ALTER TABLE EMPLOYEE_EXPENSETYPE
    ADD EMP_ID NUMBER(4);`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
    const out = formatSQL(sql);
    expect(out).toMatch(/ADD\s+emp_id NUMBER\(4\);/);
    expect(out).not.toContain('ADD COLUMN emp_id NUMBER(4)');
  });
});
