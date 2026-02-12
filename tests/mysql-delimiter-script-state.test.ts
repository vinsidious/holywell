import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('MySQL DELIMITER script boundaries', () => {
  it('continues formatting statements after a DELIMITER block', () => {
    const sql = `CREATE TABLE a (id INT);
DELIMITER $$
CREATE TRIGGER t BEFORE INSERT ON a FOR EACH ROW BEGIN END$$
DELIMITER ;
CREATE TABLE b (id INT);`;
    const out = formatSQL(sql, { dialect: 'mysql' });
    expect(out).toContain('CREATE TABLE a (\n    id INT\n);');
    expect(out).toContain('CREATE TABLE b (\n    id INT\n);');
  });

  it('parses DELIMITER $$ scripts without mis-tokenizing routine bodies', () => {
    const sql = `DELIMITER $$
CREATE PROCEDURE p()
BEGIN
  SELECT '$$';
END$$
DELIMITER ;
SELECT 1;`;
    const out = formatSQL(sql, { dialect: 'mysql' });
    expect(out).toContain("SELECT '$$';");
    expect(out).toContain('END$$');
    expect(out).toContain('SELECT 1;');
  });

  it('does not split routines when delimiter text appears inside string literals', () => {
    const sql = `DELIMITER //
CREATE PROCEDURE p()
BEGIN
  SELECT '//';
END//
DELIMITER ;
SELECT 1;`;
    const out = formatSQL(sql, { dialect: 'mysql' });
    expect(out).toContain("SELECT '//';");
    expect(out).toContain('END//');
    expect(out).toContain('SELECT 1;');
  });
});
