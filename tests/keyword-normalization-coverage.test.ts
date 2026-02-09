import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Keyword normalization for administrative and type statements', () => {
  it('uppercases USE statements', () => {
    expect(formatSQL('use student;').trim()).toBe('USE student;');
  });

  it('uppercases CREATE SCHEMA statements', () => {
    expect(formatSQL('create schema aida;').trim()).toBe('CREATE SCHEMA aida;');
  });

  it('uppercases SET ROLE TO statements', () => {
    expect(formatSQL('set role to owner;').trim()).toBe('SET ROLE TO owner;');
  });

  it('uppercases USAGE in GRANT statements', () => {
    const out = formatSQL('GRANT usage ON SCHEMA p TO r;');
    expect(out).toContain('GRANT USAGE');
  });

  it('uppercases ENUM type names in CREATE TABLE definitions', () => {
    const out = formatSQL("CREATE TABLE t (s enum('a') NOT NULL);");
    expect(out).toContain("ENUM('a')");
  });
});
