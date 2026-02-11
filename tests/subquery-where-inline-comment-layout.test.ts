import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Subquery WHERE inline comment layout', () => {
  it('places subquery WHERE and AND conditions on dedicated lines with inline comments preserved', () => {
    const sql = `SELECT *
FROM a
FULL OUTER JOIN (SELECT DISTINCT FIRMY.nazwa
                    FROM FIRMY
                    JOIN MIASTA miasto_firmy ON miasto_firmy.id_miasta = FIRMY.id_miasta
                    JOIN WOJ ON WOJ.kod_woj = miasto_firmy.kod_woj
                    JOIN ETATY ON ETATY.id_firmy = FIRMY.nazwa_skr
                    JOIN OSOBY ON OSOBY.id_osoby = ETATY.id_osoby
                    JOIN MIASTA miasto_osoby ON OSOBY.id_miasta = miasto_osoby.id_miasta
                    WHERE miasto_osoby.nazwa = @MIAST /* pracowaly osoby z miasta miast */
                      AND WOJ.kod_woj = @WOJ /* firma z wojewodztwa woj */) AS pozostale_firmy
ON 1 = 1;`;

    const out = formatSQL(sql);

    expect(out).toMatch(/miasto_osoby\.id_miasta\n\s+WHERE miasto_osoby\.nazwa = @MIAST \/\* pracowaly osoby z miasta miast \*\//);
    expect(out).toMatch(/\n\s+AND WOJ\.kod_woj = @WOJ\s+\/\* firma z wojewodztwa woj \*\//);
  });
});
