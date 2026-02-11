import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('CASE WHEN conditions with leading comments', () => {
  it('parses CASE WHEN conditions that start with a comment', () => {
    const sql = `SELECT
    CASE
      WHEN
           -- object owner always has grant options
           pg_has_role(x.grantee, x.relowner, 'USAGE')
           OR x.grantable
      THEN 'YES'
      ELSE 'NO'
    END AS is_grantable
FROM x;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('formats CREATE VIEW scripts that include CASE comments and GRANT statements', () => {
    const sql = `CREATE VIEW column_privileges AS
SELECT
    CASE
      WHEN
           -- object owner always has grant options
           pg_has_role(x.grantee, x.relowner, 'USAGE')
           OR x.grantable
      THEN 'YES'
      ELSE 'NO'
    END AS is_grantable
FROM x;

GRANT SELECT ON column_privileges TO PUBLIC;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('CREATE VIEW column_privileges AS');
    expect(out).toContain('GRANT SELECT');
    expect(out).toContain('TO PUBLIC;');
  });

  it('parses parenthesized row expansion expressions in SELECT lists', () => {
    const sql = `SELECT (aclexplode(coalesce(relacl, acldefault('r', relowner)))).*
FROM pg_class;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('parses derived tables when the subquery body starts with a comment', () => {
    const sql = `SELECT *
FROM (
    /* check constraints */
    SELECT DISTINCT nr.nspname
      FROM pg_namespace nr
) AS x;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('parses composite field access from parenthesized expressions', () => {
    const sql = `SELECT CAST((ss.x).n AS cardinal_number)
FROM ss;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('parses JOIN clauses with comments between alias and ON', () => {
    const sql = `SELECT *
FROM pg_constraint con
LEFT JOIN pg_depend d1  -- find constraint's dependency on an index
  ON d1.objid = con.oid;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('parses CAST expressions when comments precede the cast argument', () => {
    const sql = `SELECT CAST(
  -- explain cast argument
  1 AS cardinal_number
);`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('parses comma-separated FROM items when comments precede a VALUES table source', () => {
    const sql = `SELECT em.text
FROM pg_namespace n,
     -- trigger event mapping
     (VALUES (4, 'INSERT'), (8, 'DELETE')) AS em (num, text);`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });

  it('parses FROM clauses that mix JOIN and comma-separated sources', () => {
    const sql = `SELECT um.oid, s.foreign_server_name
FROM pg_user_mapping um
LEFT JOIN pg_authid u ON (u.oid = um.umuser),
     _pg_foreign_servers s
WHERE s.oid = um.umserver;`;

    expect(() => parse(sql, { recover: false })).not.toThrow();
  });
});
