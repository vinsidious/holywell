import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('Insert values tuple wrapping', () => {
  it('breaks long VALUES tuples into one value per line', () => {
    const sql = `INSERT INTO events (titulo, descricao, data, hora, id_criador, local, categoria, preco, imagens)
VALUES ('Teatro', 'A vida e uma jornada cheia de altos e baixos, desafios e oportunidades.', '2023-09-15', '23:00', 1, 'Rua Barretos de Cachias, Bairro Villa Rica, numero 897', 'Festa', 50.00, 'https://diariodocomercio.com.br/wp-content/uploads/2023/01/festa-pic.jpg');`;

    const out = formatSQL(sql);
    expect(out).toMatch(/VALUES \(\n/);
    expect(out).toContain('\n       );');
  });
});
