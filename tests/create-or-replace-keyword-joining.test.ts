import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('CREATE OR REPLACE keyword joining', () => {
  it('joins split CREATE and OR REPLACE keywords for routine definitions', () => {
    const sql = `CREATE
OR REPLACE FUNCTION public.handle_new_user () RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

    const out = formatSQL(sql);
    expect(out).toContain('CREATE OR REPLACE FUNCTION public.handle_new_user ()');
    expect(out).not.toContain('CREATE\nOR REPLACE FUNCTION');
  });
});
