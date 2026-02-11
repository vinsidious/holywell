import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('MySQL keyword and function casing', () => {
  it('uppercases MySQL text type keywords', () => {
    const out = formatSQL('CREATE TABLE t (a tinytext, b mediumtext, c longtext, d text);', { dialect: 'mysql' });
    expect(out).toContain('a TINYTEXT');
    expect(out).toContain('b MEDIUMTEXT');
    expect(out).toContain('c LONGTEXT');
    expect(out).toContain('d TEXT');
  });

  it('uppercases NEXT VALUE FOR in column defaults', () => {
    const out = formatSQL('CREATE TABLE t (a BIGINT DEFAULT NEXT VALUE FOR seq1);');
    expect(out).toContain('DEFAULT NEXT VALUE FOR seq1');
    expect(out).not.toContain('DEFAULT next VALUE FOR');
  });

  it('uppercases GENERATED ALWAYS AS ... STORED in column definitions', () => {
    const out = formatSQL('CREATE TABLE t (id INT generated always AS (col1 + col2) stored);');
    expect(out).toContain('INT GENERATED ALWAYS AS (col1 + col2) STORED');
  });

  it('uppercases MySQL date and time function names consistently', () => {
    const out = formatSQL('SELECT CURTIME(), CURDATE(), NOW(), DAYOFWEEK(NOW()), DATE_FORMAT(NOW(), \'%Y-%m-%d\');', { dialect: 'mysql' });
    expect(out).toContain('CURTIME()');
    expect(out).toContain('CURDATE()');
    expect(out).toContain('NOW()');
    expect(out).toContain('DAYOFWEEK(NOW())');
    expect(out).toContain('DATE_FORMAT(NOW(), \'%Y-%m-%d\')');
  });
});

