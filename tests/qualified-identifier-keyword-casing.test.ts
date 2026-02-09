import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Qualified identifiers that match keywords', () => {
  it('preserves identifier casing in REFERENCES when object names match reserved words', () => {
    const sql = `ALTER TABLE ONLY public.address
    ADD CONSTRAINT c1 FOREIGN KEY (user_id) REFERENCES public.user (id);`;

    const out = formatSQL(sql);
    expect(out).toContain('REFERENCES public.user (id)');
    expect(out).not.toContain('REFERENCES public.USER');
  });

  it('preserves identifier casing in ALTER DOMAIN statements', () => {
    const sql = `CREATE DOMAIN public.year AS integer;
ALTER DOMAIN public.year OWNER TO postgres;`;

    const out = formatSQL(sql);
    expect(out).toContain('CREATE DOMAIN public.year AS integer;');
    expect(out).toContain('ALTER DOMAIN public.year OWNER TO postgres;');
    expect(out).not.toContain('ALTER DOMAIN public.YEAR');
  });
});

