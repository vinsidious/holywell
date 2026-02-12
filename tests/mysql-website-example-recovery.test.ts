import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('mysql website example parsing coverage', () => {
  it('formats the mysql website example without parse-error recovery', () => {
    const sql = readFileSync('website/examples/mysql.sql', 'utf8');
    const recoveries: string[] = [];
    const passthrough: string[] = [];

    formatSQL(sql, {
      dialect: 'mysql',
      onRecover: err => recoveries.push(err.message),
      onPassthrough: raw => passthrough.push(raw.text),
    });

    expect(recoveries).toHaveLength(0);
    expect(passthrough).toHaveLength(13);

    const nodes = parse(sql, { dialect: 'mysql', recover: true });
    const parseErrorRawNodes = nodes.filter(node => node.type === 'raw' && node.reason === 'parse_error');
    const unsupportedRawNodes = nodes.filter(node => node.type === 'raw' && node.reason === 'unsupported');
    expect(parseErrorRawNodes).toHaveLength(0);
    expect(unsupportedRawNodes).toHaveLength(13);
  });

  it('parses and formats mysql-specific select modifiers', () => {
    const straightJoinSql = "SELECT STRAIGHT_JOIN c.username, o.id, o.total FROM customers c INNER JOIN orders o ON o.customer_id = c.id WHERE c.region = 'NA' ORDER BY o.total DESC LIMIT 20;";
    expect(() => parse(straightJoinSql, { dialect: 'mysql', recover: false })).not.toThrow();

    const straightJoinOut = formatSQL(straightJoinSql, { dialect: 'mysql' });
    expect(straightJoinOut).toContain('SELECT STRAIGHT_JOIN');
    expect(straightJoinOut).toContain('INNER JOIN orders AS o');
    expect(straightJoinOut).toContain('ON o.customer_id = c.id');

    const calcFoundRowsSql = "SELECT SQL_CALC_FOUND_ROWS p.id, p.name, p.price FROM products p ORDER BY p.name LIMIT 50, 25;";
    expect(() => parse(calcFoundRowsSql, { dialect: 'mysql', recover: false })).not.toThrow();

    const calcFoundRowsOut = formatSQL(calcFoundRowsSql, { dialect: 'mysql' });
    expect(calcFoundRowsOut).toContain('SELECT SQL_CALC_FOUND_ROWS');
  });

  it('parses match-against predicates and legacy values() upsert expressions', () => {
    const matchSql = "SELECT id, name FROM products WHERE MATCH(name, description) AGAINST ('+wireless -bluetooth' IN BOOLEAN MODE);";
    expect(() => parse(matchSql, { dialect: 'mysql', recover: false })).not.toThrow();
    const matchOut = formatSQL(matchSql, { dialect: 'mysql' });
    expect(matchOut).toContain("MATCH(name, description) AGAINST ('+wireless -bluetooth' IN BOOLEAN MODE)");

    const duplicateSql = "INSERT INTO products (sku, name, price) VALUES ('WIDGET-01', 'Widget', 9.99) ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price);";
    expect(() => parse(duplicateSql, { dialect: 'mysql', recover: false })).not.toThrow();
    const duplicateOut = formatSQL(duplicateSql, { dialect: 'mysql' });
    expect(duplicateOut).toContain('name = VALUES(name)');
    expect(duplicateOut).toContain('price = VALUES(price)');
  });

  it('parses explain format equals syntax and select into outfile placement', () => {
    const explainSql = 'EXPLAIN FORMAT=JSON SELECT * FROM orders WHERE customer_id = 42;';
    expect(() => parse(explainSql, { dialect: 'mysql', recover: false })).not.toThrow();
    const explainOut = formatSQL(explainSql, { dialect: 'mysql' });
    expect(explainOut).toContain('EXPLAIN (FORMAT JSON)');

    const outfileSql = "SELECT id, sku, name, price FROM products WHERE is_active = 1 INTO OUTFILE '/tmp/active_products.csv' FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\\n';";
    expect(() => parse(outfileSql, { dialect: 'mysql', recover: false })).not.toThrow();
    const outfileOut = formatSQL(outfileSql, { dialect: 'mysql' });
    expect(outfileOut).toContain('WHERE is_active = 1');
    expect(outfileOut).toContain("INTO OUTFILE '/tmp/active_products.csv'");
  });

  it('parses and formats mysql replace-into statements', () => {
    const replaceSql = "REPLACE INTO products (sku, name, price) VALUES ('WIDGET-01', 'Widget Pro', 12.99);";
    expect(() => parse(replaceSql, { dialect: 'mysql', recover: false })).not.toThrow();

    const replaceOut = formatSQL(replaceSql, { dialect: 'mysql' });
    expect(replaceOut).toContain('REPLACE INTO products');
    expect(replaceOut).toContain("VALUES ('WIDGET-01', 'Widget Pro', 12.99)");
  });

  it('parses mysql set/show statements as structured nodes', () => {
    const sql = [
      'SET NAMES utf8mb4;',
      "SET sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';",
      "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';",
      'SHOW CREATE TABLE orders;',
    ].join('\n');

    const nodes = parse(sql, { dialect: 'mysql', recover: false });
    expect(nodes.map(node => node.type)).toEqual(['set', 'set', 'show', 'show']);

    const out = formatSQL(sql, { dialect: 'mysql' });
    expect(out).toContain('SET NAMES utf8mb4;');
    expect(out).toContain("SET sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';");
    expect(out).toContain("SHOW VARIABLES LIKE 'innodb_buffer_pool_size';");
    expect(out).toContain('SHOW CREATE TABLE orders;');
  });
});
