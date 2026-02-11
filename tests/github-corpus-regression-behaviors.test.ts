import { describe, expect, it } from 'bun:test';
import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

const root = join(import.meta.dir, '..');
const cliPath = join(root, 'src', 'cli.ts');
const bunPath = process.execPath;
const decoder = new TextDecoder();

function runCliWithStdin(args: string[], stdinContent: string, cwd: string = root) {
  const proc = Bun.spawnSync({
    cmd: [bunPath, cliPath, ...args],
    cwd,
    stdin: new TextEncoder().encode(stdinContent),
    stdout: 'pipe',
    stderr: 'pipe',
    env: process.env,
  });

  return {
    code: proc.exitCode,
    out: decoder.decode(proc.stdout),
    err: decoder.decode(proc.stderr),
  };
}

describe('GitHub corpus regression behaviors (2026-02-08)', () => {
  it('ALTER TABLE ADD does not inject COLUMN for constraints', () => {
    const out = formatSQL('ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id);');
    expect(out).not.toContain('ADD COLUMN CONSTRAINT');
    expect(out).toContain('ADD CONSTRAINT fk_users_role');
  });

  it('FOREIGN KEY table elements are parsed as constraints, not columns', () => {
    const out = formatSQL('CREATE TABLE child (id INT, FOREIGN KEY (id) REFERENCES parent (id));');
    expect(out).toContain('FOREIGN KEY (id)');
    expect(out).not.toContain('FOREIGN    KEY');
  });

  it('UNIQUE table elements are parsed as constraints, not columns', () => {
    const out = formatSQL('CREATE TABLE pivot (author_id INT, blog_id INT, UNIQUE(author_id, blog_id));');
    expect(out).toContain('UNIQUE (author_id, blog_id)');
    expect(out).not.toContain('UNIQUE    (');
  });

  it('preserves ON DELETE NO ACTION / ON UPDATE NO ACTION', () => {
    const out = formatSQL('CREATE TABLE c (id INT, CONSTRAINT fk FOREIGN KEY (id) REFERENCES p (id) ON DELETE NO ACTION ON UPDATE NO ACTION);');
    expect(out).toContain('ON DELETE NO ACTION');
    expect(out).toContain('ON UPDATE NO ACTION');
    expect(out).not.toContain('ON DELETE NO,');
  });

  it('keeps leading comments before first statement', () => {
    const out = formatSQL('\n\n-- file header\n-- license\nSELECT 1;');
    expect(out).toContain('/* file header */');
    expect(out).toContain('/* license */');
    expect(out).toContain('SELECT 1;');
  });

  it('keeps procedure body statements inside BEGIN...END block', () => {
    const out = formatSQL('CREATE PROCEDURE p() BEGIN DELETE FROM t WHERE id = 1; UPDATE t SET x = 2; END;');
    const createPos = out.indexOf('CREATE PROCEDURE');
    const beginPos = out.indexOf('BEGIN', createPos);
    const deletePos = out.indexOf('DELETE', beginPos);
    const updatePos = out.indexOf('UPDATE t', deletePos);
    const endPos = out.indexOf('END', updatePos);

    expect(createPos).toBeGreaterThanOrEqual(0);
    expect(beginPos).toBeGreaterThan(createPos);
    expect(deletePos).toBeGreaterThan(beginPos);
    expect(updatePos).toBeGreaterThan(deletePos);
    expect(endPos).toBeGreaterThan(updatePos);
  });

  it('preserves commas between consecutive CONSTRAINT definitions', () => {
    const out = formatSQL('CREATE TABLE t (id INT, CONSTRAINT a UNIQUE (id), CONSTRAINT b FOREIGN KEY (id) REFERENCES x (id));');
    expect(out).toMatch(/CONSTRAINT a[\s\S]*,\n[\s\S]*CONSTRAINT b/);
  });

  it('preserves $ inside identifiers like gv_$sql', () => {
    const out = formatSQL('SELECT gv_$sql FROM dual;');
    expect(out).toContain('gv_$sql');
    expect(out).not.toContain('gv_ $ sql');
  });

  it('preserves identifier case in procedure bodies', () => {
    const out = formatSQL('CREATE PROCEDURE p() BEGIN SELECT pName, fieldId FROM t; END;');
    expect(out).toContain('pName');
    expect(out).toContain('fieldId');
  });

  it('fatal tokenize errors return non-zero exit code in CLI', () => {
    const res = runCliWithStdin([], "SELECT 'unterminated");
    expect(res.code).toBe(2);
    expect(res.out).toBe('');
    expect(res.err).toContain('Parse error');
  });

  it('preserves trailing comma in CREATE TABLE element list', () => {
    const out = formatSQL('CREATE TABLE t (id INT,);');
    expect(out).toMatch(/id INT,\n\);/);
  });

  it('parses CREATE TABLE IF NOT EXISTS in strict mode', () => {
    expect(() => parse('CREATE TABLE IF NOT EXISTS t (id INT);', { recover: false })).not.toThrow();
  });

  it('formats WITH / WITH RECURSIVE statements', () => {
    const out = formatSQL('WITH RECURSIVE r AS (SELECT 1) SELECT * FROM r;');
    expect(out).toContain('WITH RECURSIVE r AS');
    expect(out).toContain('SELECT *');
  });

  it('keeps T-SQL IF ... BEGIN ... END as one block', () => {
    const sql = "IF EXISTS (SELECT 1) BEGIN PRINT @x; SELECT @x; END";
    const out = formatSQL(sql);
    const ifPos = out.indexOf('IF EXISTS');
    const beginPos = out.indexOf('BEGIN', ifPos);
    const endPos = out.indexOf('END', beginPos);
    expect(ifPos).toBeGreaterThanOrEqual(0);
    expect(beginPos).toBeGreaterThan(ifPos);
    expect(endPos).toBeGreaterThan(beginPos);
  });

  it('keeps DELIMITER blocks and subsequent SQL intact', () => {
    const sql = 'DELIMITER ;;\nCREATE TRIGGER tr AFTER INSERT ON film FOR EACH ROW BEGIN\n  INSERT INTO film_text VALUES (NEW.film_id, NEW.title);\nEND;;\nDELIMITER ;\nSELECT 1;';
    const out = formatSQL(sql, { dialect: 'mysql' });
    expect(out).toContain('DELIMITER ;;');
    expect(out).toContain('END;;');
    expect(out).toContain('SELECT 1;');
  });

  it('parses function-expression index columns', () => {
    expect(() => parse('CREATE INDEX idx_lower_name ON users (LOWER(name));', { recover: false })).not.toThrow();
  });

  it('parses BigQuery backtick multipart identifiers', () => {
    expect(() => parse('SELECT * FROM `project.dataset.table`;', { recover: false })).not.toThrow();
    const out = formatSQL('SELECT * FROM `project.dataset.table`;');
    expect(out).toContain('`project.dataset.table`');
  });

  it('recognizes CREATE MATERIALIZED VIEW', () => {
    expect(() => parse('CREATE MATERIALIZED VIEW mv AS SELECT 1;', { recover: false })).not.toThrow();
    const out = formatSQL('CREATE MATERIALIZED VIEW mv AS SELECT 1;');
    expect(out).toContain('CREATE MATERIALIZED VIEW mv AS');
  });

  it('parses GROUP_CONCAT ... SEPARATOR syntax', () => {
    expect(() => parse("SELECT GROUP_CONCAT(name SEPARATOR ',') FROM users;", { recover: false, dialect: 'mysql' })).not.toThrow();
    const out = formatSQL("SELECT GROUP_CONCAT(name SEPARATOR ',') FROM users;", { dialect: 'mysql' });
    expect(out).toContain("GROUP_CONCAT(name SEPARATOR ',')");
  });

  it('formats CREATE TABLE AS SELECT (CTAS)', () => {
    const out = formatSQL('CREATE TABLE archived_users AS SELECT id, email FROM users WHERE active = 0;');
    expect(out).toContain('CREATE TABLE archived_users AS');
    expect(out).toContain('\nSELECT id, email');
  });

  it('parses two-argument LIMIT syntax', () => {
    expect(() => parse('SELECT * FROM users LIMIT 20, 10;', { recover: false })).not.toThrow();
    const out = formatSQL('SELECT * FROM users LIMIT 20, 10;');
    expect(out).toContain('LIMIT 10');
    expect(out).toContain('OFFSET 20');
  });

  it('parses schema-qualified CREATE TABLE names', () => {
    expect(() => parse('CREATE TABLE "public"."profiles" (id INT);', { recover: false })).not.toThrow();
  });

  it('parses named PRIMARY KEY declarations in CREATE TABLE', () => {
    expect(() => parse('CREATE TABLE t (`id` INT, PRIMARY KEY `pk_name` (`id`));', { recover: false })).not.toThrow();
    const out = formatSQL('CREATE TABLE t (`id` INT, PRIMARY KEY `pk_name` (`id`));');
    expect(out).toContain('PRIMARY KEY `pk_name` (`id`)');
  });

  it('parses PostgreSQL DO $$ blocks in strict mode', () => {
    expect(() => parse("DO $$ BEGIN RAISE NOTICE 'x'; END $$;", { recover: false })).not.toThrow();
  });

  it('parses GENERATE_SERIES as table function in FROM', () => {
    expect(() => parse('SELECT * FROM generate_series(1, 3) AS s(i);', { recover: false })).not.toThrow();
  });

  it('parses ROW_NUMBER in inline subqueries', () => {
    expect(() => parse('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY id) AS rn FROM t) AS s;', { recover: false })).not.toThrow();
  });

  it('parses parenthesized top-level query with ORDER BY', () => {
    expect(() => parse('(SELECT id FROM t) ORDER BY id;', { recover: false })).not.toThrow();
    const out = formatSQL('(SELECT id FROM t) ORDER BY id;');
    expect(out).toContain('ORDER BY id;');
  });

  it('parses INTERVAL value/unit syntax', () => {
    expect(() => parse("SELECT INTERVAL '1' DAY;", { recover: false })).not.toThrow();
  });

  it('parses GIN indexes with operator classes', () => {
    expect(() => parse('CREATE INDEX idx_trgm ON docs USING gin (title gin_trgm_ops);', { recover: false })).not.toThrow();
    const out = formatSQL('CREATE INDEX idx_trgm ON docs USING gin (title gin_trgm_ops);');
    expect(out).toContain('gin_trgm_ops');
  });

  it('keeps MySQL conditional-comment semicolon on same line', () => {
    const out = formatSQL('/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;');
    expect(out).toContain('*/;');
    expect(out).not.toContain('*/\n;');
  });

  it('does not insert blank lines between consecutive plain JOINs', () => {
    const out = formatSQL('SELECT * FROM a JOIN b ON a.id = b.id JOIN c ON b.id = c.id;');
    expect(out).not.toMatch(/JOIN b[\s\S]*\n\s*\n\s*JOIN c/);
  });

  it('keeps procedure body statements inside BEGIN...END and formatted line-by-line', () => {
    const out = formatSQL('CREATE PROCEDURE p() BEGIN SELECT 1; SELECT 2; END;');
    expect(out).toContain('BEGIN');
    expect(out).toMatch(/BEGIN[\s\S]*SELECT 1;[\s\S]*SELECT 2;[\s\S]*END;/);
  });

  it('emits HAVING as a dedicated clause line', () => {
    const out = formatSQL('SELECT dept, COUNT(*) FROM staff GROUP BY dept HAVING COUNT(*) > 1 ORDER BY dept;');
    expect(out).toContain('\nHAVING COUNT(*) > 1');
  });

  it('keeps subquery FROM clause river-aligned', () => {
    const out = formatSQL('SELECT * FROM (SELECT a FROM t WHERE a > 0) AS sub;');
    expect(out).toContain('(SELECT a');
    expect(out).toContain('\n          FROM t');
  });

  it('preserves blank lines between comment paragraphs', () => {
    const out = formatSQL('-- paragraph 1\n\n-- paragraph 2\nSELECT 1;');
    expect(out).toContain('/* paragraph 1 */\n\n/* paragraph 2 */');
  });

  it('enforces indentation for CREATE TABLE columns', () => {
    const out = formatSQL('CREATE TABLE t (a int,b int);');
    expect(out).toContain('\n    a');
    expect(out).toContain('\n    b');
  });

  it('formats INSERT ... SELECT statements', () => {
    const out = formatSQL('INSERT INTO archive (id, email) SELECT id, email FROM users;');
    expect(out).toContain('INSERT INTO archive (id, email)');
    expect(out).toContain('\nSELECT id, email');
    expect(out).toContain('\n  FROM users;');
  });

  it('keeps first BEGIN-body statement on a new line', () => {
    const out = formatSQL('BEGIN -- comment\nDECLARE x INT; END;');
    expect(out).toMatch(/BEGIN[\s\S]*\nDECLARE x INT;/);
  });

  it('wraps long INSERT column lists across lines', () => {
    const out = formatSQL('INSERT INTO t (a, b, c, d, e, f, g, h, i, j, k) VALUES (1,2,3,4,5,6,7,8,9,10,11);');
    expect(out).toContain('INSERT INTO t (');
    expect(out).toContain('\nVALUES (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);');
    expect(out).toContain('\n');
    expect(out).not.toContain('INSERT INTO t (a, b, c, d, e, f, g, h, i, j, k) VALUES');
  });

  it('exits non-zero when parser recovers from invalid statements', () => {
    const dir = mkdtempSync(join(tmpdir(), 'holywell-recover-'));
    const res = runCliWithStdin([], 'SELECT 1; SELECT (1;', dir);
    expect(res.code).toBe(2);
    expect(res.err).toContain('Warning:');
  });
});
