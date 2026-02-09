import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('EXCLUDE USING spacing', () => {
  it('uses a single space between USING and index method', () => {
    const out = formatSQL('CREATE TABLE t (c circle, EXCLUDE USING gist(c WITH &&));');
    expect(out).toContain('EXCLUDE USING gist(c WITH &&)');
    expect(out).not.toContain('EXCLUDE USING  gist');
  });
});

