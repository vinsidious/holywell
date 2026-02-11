import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('MySQL routine block formatting', () => {
  it('keeps BEGIN/END body output stable across repeated formatting', () => {
    const sql = `CREATE TRIGGER upd_film AFTER UPDATE ON film FOR EACH ROW BEGIN
    IF (old.title != new.title) OR (old.description != new.description) THEN
        SELECT COUNT(*) FROM tmpCustomer INTO count_rewardees;
    END IF;
END;`;

    const once = formatSQL(sql, { dialect: 'mysql' });
    const twice = formatSQL(once, { dialect: 'mysql' });

    expect(twice).toBe(once);
    expect(once).toContain('THEN');
    expect(once).toContain('SELECT COUNT(*) FROM tmpCustomer INTO count_rewardees;');
  });
});
