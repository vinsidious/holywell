import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('MySQL DELIMITER script boundaries', () => {
  it('continues formatting statements after a DELIMITER block', () => {
    const sql = `CREATE TABLE a (id INT);
DELIMITER $$
CREATE TRIGGER t BEFORE INSERT ON a FOR EACH ROW BEGIN END$$
DELIMITER ;
CREATE TABLE b (id INT);`;
    const out = formatSQL(sql);
    expect(out).toContain('CREATE TABLE a (\n    id INT\n);');
    expect(out).toContain('CREATE TABLE b (\n    id INT\n);');
  });
});
