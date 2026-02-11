/**
 * Node.js smoke test — validates the built package works on Node 18/20/22.
 * Runs against dist/ (not source), so build must complete first.
 * Exit 0 = pass, exit 1 = fail.
 */

import { formatSQL, parse, tokenize, version } from '../dist/index.js';

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures++;
  } else {
    console.log(`PASS: ${message}`);
  }
}

// version export
assert(typeof version === 'string' && version.length > 0, 'version is a non-empty string');

// Basic SELECT formatting
const selectResult = formatSQL('SELECT id, name, email FROM users WHERE active = true ORDER BY name;');
assert(selectResult.includes('SELECT'), 'formatSQL produces SELECT');
assert(selectResult.includes('FROM users'), 'formatSQL produces FROM clause');
assert(selectResult.includes('ORDER BY'), 'formatSQL produces ORDER BY clause');

// Multi-statement
const multi = formatSQL('SELECT 1; SELECT 2;');
assert(multi.includes('SELECT 1;') && multi.includes('SELECT 2;'), 'formatSQL handles multiple statements');

// parse() returns AST nodes
const ast = parse('SELECT id FROM users;');
assert(Array.isArray(ast) && ast.length === 1, 'parse returns array with one statement');
assert(ast[0].type === 'select', 'parse produces select node');

// parse with recovery
const recovered = parse('SELECT 1; SELECT (; SELECT 2;', { recover: true });
assert(recovered.length === 3, 'parse recovers from errors');

// tokenize() returns tokens
const tokens = tokenize('SELECT 1 FROM t;');
assert(Array.isArray(tokens) && tokens.length > 0, 'tokenize returns non-empty array');
const selectToken = tokens.find(t => t.upper === 'SELECT');
assert(selectToken && selectToken.type === 'keyword', 'tokenize identifies SELECT as keyword');

// CLI entry point exists and has shebang
import { readFileSync } from 'fs';
const cliBuild = readFileSync(new URL('../dist/cli.cjs', import.meta.url), 'utf8');
assert(cliBuild.startsWith('#!/usr/bin/env node'), 'CLI build has node shebang');

// DDL formatting
const ddl = formatSQL('CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100) NOT NULL);');
assert(ddl.includes('CREATE TABLE'), 'formatSQL handles DDL');

// Idempotency check
const sql = 'SELECT a, b, c FROM t WHERE x = 1 AND y = 2;';
const first = formatSQL(sql);
const second = formatSQL(first);
assert(first === second, 'formatSQL is idempotent');

console.log(`\n${failures === 0 ? 'All tests passed' : `${failures} test(s) failed`}`);
process.exit(failures === 0 ? 0 : 1);
