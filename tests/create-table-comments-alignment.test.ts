import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('CREATE TABLE alignment with interleaved comments', () => {
  it('keeps aligned four-space layout when inline comments appear between definitions', () => {
    const sql = `CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  email VARCHAR(255) NOT NULL, -- user email
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;
    const out = formatSQL(sql);
    expect(out).toContain('-- user email');
    expect(out).toContain('\n    id');
    expect(out).toContain('\n    email');
    expect(out).toContain('\n    password_hash');
    expect(out).not.toContain('\n  id BIGINT PRIMARY KEY,');
  });
});
