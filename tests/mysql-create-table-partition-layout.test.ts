import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('MySQL CREATE TABLE partition layout', () => {
  it('keeps partition-opening parenthesis on the PARTITION BY line and formats one partition per line', () => {
    const sql = `CREATE TABLE audit_log (
    id         BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    event_type VARCHAR(50)      NOT NULL,
    payload    JSON,
    created_at DATE             NOT NULL,
               PRIMARY KEY (id, created_at),
               KEY idx_event (event_type)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4
  PARTITION BY RANGE(YEAR(created_at))(PARTITION p2022 VALUES LESS THAN(2023), PARTITION p2023 VALUES LESS THAN(2024), PARTITION p2024 VALUES LESS THAN(2025), PARTITION p_future VALUES LESS THAN MAXVALUE);`;

    const expected = `CREATE TABLE audit_log (
    id         BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    event_type VARCHAR(50)      NOT NULL,
    payload    JSON,
    created_at DATE             NOT NULL,
               PRIMARY KEY (id, created_at),
               KEY idx_event (event_type)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4
  PARTITION BY RANGE (YEAR(created_at)) (
      PARTITION p2022 VALUES LESS THAN (2023),
      PARTITION p2023 VALUES LESS THAN (2024),
      PARTITION p2024 VALUES LESS THAN (2025),
      PARTITION p_future VALUES LESS THAN MAXVALUE
  );`;

    expect(formatSQL(sql, { dialect: 'mysql' }).trimEnd()).toBe(expected);
  });
});
