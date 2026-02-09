import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('CREATE statement comment and keyword casing', () => {
  it('keeps leading comments before passthrough CREATE object statements', () => {
    const sql = `-- db marker
CREATE DATABASE mydb;
-- type marker
CREATE TYPE mytype;
-- sequence marker
CREATE SEQUENCE seq_a;
-- domain marker
CREATE DOMAIN d1 AS integer;
-- extension marker
CREATE EXTENSION hstore;
-- role marker
CREATE ROLE app_role;
-- user marker
CREATE USER app_user;
-- publication marker
CREATE PUBLICATION pub_all FOR ALL TABLES;`;

    const out = formatSQL(sql);
    expect(out).toContain('-- db marker');
    expect(out).toContain('-- type marker');
    expect(out).toContain('-- sequence marker');
    expect(out).toContain('-- domain marker');
    expect(out).toContain('-- extension marker');
    expect(out).toContain('-- role marker');
    expect(out).toContain('-- user marker');
    expect(out).toContain('-- publication marker');
  });

  it('uppercases CREATE keywords for object statements handled as passthrough', () => {
    const sql = `create database app_db;
create extension pg_trgm;
create role app_role;
create user app_user;
create publication app_pub for all tables;`;

    const out = formatSQL(sql);
    expect(out).toContain('CREATE DATABASE app_db;');
    expect(out).toContain('CREATE EXTENSION pg_trgm;');
    expect(out).toContain('CREATE ROLE app_role;');
    expect(out).toContain('CREATE USER app_user;');
    expect(out).toContain('CREATE PUBLICATION app_pub FOR ALL');
  });
});
