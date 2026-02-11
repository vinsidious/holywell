import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';
import { parse } from '../src/parser';

describe('Oracle type body declarations', () => {
  it('parses and preserves member functions inside CREATE OR REPLACE TYPE BODY blocks', () => {
    const sql = `CREATE OR REPLACE TYPE BODY money AS
  MEMBER FUNCTION amount_in_eur RETURN NUMBER AS
  BEGIN
    RETURN self.amount * self.eur_exchange_rate;
  END;

  MEMBER FUNCTION display_in_eur RETURN VARCHAR2 AS
  BEGIN
    RETURN to_char(round(self.amount_in_eur, 2));
  END;
END;
/`;

    expect(() => parse(sql, { recover: false })).not.toThrow();

    const out = formatSQL(sql, { recover: false });
    expect(out).toContain('CREATE OR REPLACE TYPE BODY money AS');
    expect(out).toContain('MEMBER FUNCTION amount_in_eur RETURN NUMBER AS');
    expect(out).toContain('MEMBER FUNCTION display_in_eur RETURN VARCHAR2 AS');
    expect(out).toContain('END;\n/');
  });
});
