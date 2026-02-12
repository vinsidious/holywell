import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('CREATE TABLE users column and table constraint layout', () => {
  it('formats the mixed inline and wrapped PostgreSQL constraints predictably', () => {
    const sql = `CREATE TABLE users (
    id            BIGSERIAL   PRIMARY KEY,
    org_id        UUID        NOT NULL
                              REFERENCES organizations (id) ON DELETE CASCADE,
    email         TEXT        NOT NULL,
    display_name  TEXT        NOT NULL,
    password_hash BYTEA       NOT NULL,
    avatar_url    TEXT,
    preferences   JSONB
                              DEFAULT '{"theme": "light", "notifications": true}'::JSONB,
    tags          TEXT[]      DEFAULT '{}',
    role          TEXT        NOT NULL DEFAULT 'member'
                              CHECK(role IN ('owner', 'admin', 'member',
                                             'viewer')),
    last_login_ip INET,
    total_logins  INTEGER     DEFAULT 0 GENERATED ALWAYS AS IDENTITY,
    search_doc    TSVECTOR
                              GENERATED ALWAYS AS (to_tsvector('english',
                              COALESCE(display_name, '') || ' ' ||
                              COALESCE(email, ''))) STORED,
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (org_id, email)
);`;

    const expected = `CREATE TABLE users (
    id            BIGSERIAL   PRIMARY KEY,
    org_id        UUID        NOT NULL
                              REFERENCES organizations (id) ON DELETE CASCADE,
    email         TEXT        NOT NULL,
    display_name  TEXT        NOT NULL,
    password_hash BYTEA       NOT NULL,
    avatar_url    TEXT,
    preferences   JSONB       DEFAULT '{"theme": "light", "notifications": true}'::JSONB,
    tags          TEXT[]      DEFAULT '{}',
    role          TEXT        NOT NULL DEFAULT 'member'
                              CHECK(role IN ('owner', 'admin', 'member', 'viewer')),
    last_login_ip INET,
    total_logins  INTEGER     DEFAULT 0 GENERATED ALWAYS AS IDENTITY,
    search_doc    TSVECTOR
                              GENERATED ALWAYS AS (to_tsvector('english',
                              COALESCE(display_name, '') || ' ' ||
                              COALESCE(email, ''))) STORED,
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE (org_id, email)
);
`;

    expect(formatSQL(sql)).toBe(expected);
  });
});
