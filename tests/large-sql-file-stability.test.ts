import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

function buildLargeInsertScript(targetBytes: number): string {
  const table = `CREATE TABLE telemetry (
    id INTEGER,
    category TEXT,
    reading INTEGER,
    created_at TIMESTAMP
);`;
  const row = `INSERT INTO telemetry (id, category, reading, created_at) VALUES (1, 'sensor', 42, NOW());`;

  const chunks: string[] = [table];
  let size = table.length;
  while (size < targetBytes) {
    chunks.push(row);
    size += row.length + 1;
  }
  return chunks.join('\n');
}

describe('Large SQL file stability', () => {
  it('formats multi-megabyte SQL input without crashing', () => {
    const sql = buildLargeInsertScript(2_000_000);
    const out = formatSQL(sql);

    expect(out.length).toBeGreaterThan(1_000_000);
    expect(out).toContain('CREATE TABLE telemetry');
    expect(out).toContain('INSERT INTO telemetry');
  }, 30000);
});
