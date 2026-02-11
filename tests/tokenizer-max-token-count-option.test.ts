import { describe, expect, it } from 'bun:test';
import { parse } from '../src/parser';

describe('Tokenizer max token count option', () => {
  it('allows callers to raise the token ceiling for large statements', () => {
    const sql = 'SELECT 1, 2, 3, 4, 5, 6, 7, 8, 9, 10;';

    expect(() => parse(sql, { recover: false, maxTokenCount: 5 } as never)).toThrow();
    expect(() => parse(sql, { recover: false, maxTokenCount: 200 } as never)).not.toThrow();
  });
});
