import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('MySQL trigger IF body layout', () => {
  it('keeps statements indented under THEN without blank spacer lines', () => {
    const sql = `CREATE TRIGGER test_trigger
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' THEN
        INSERT INTO audit_log (order_id)
        VALUES (NEW.order_id);
    END IF;
END`;

    const out = formatSQL(sql, { dialect: 'mysql' });

    expect(out).toContain("IF NEW.status = 'cancelled' THEN");
    expect(out).not.toContain('THEN\n\n');
    expect(out).toMatch(/THEN\n\s{8}INSERT INTO audit_log \(order_id\)/);
    expect(out).toMatch(/\n\s{4}END IF;/);
  });
});
