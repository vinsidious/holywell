import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('GROUP_CONCAT order and separator idempotency', () => {
  it('stabilizes formatting for GROUP_CONCAT with ORDER BY and SEPARATOR', () => {
    const sql = `SELECT department,
       GROUP_CONCAT(
           employee_name
           ORDER BY employee_name
           SEPARATOR ', '
       ) AS team_members
FROM employees
GROUP BY department;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const once = formatSQL(sql);
    const twice = formatSQL(once);
    const thrice = formatSQL(twice);

    expect(twice).toBe(once);
    expect(thrice).toBe(twice);
    expect(once).toContain("GROUP_CONCAT(employee_name ORDER BY employee_name SEPARATOR ', ')");
  });
});
