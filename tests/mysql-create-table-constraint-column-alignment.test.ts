import { describe, expect, it } from 'bun:test';
import { formatSQL } from '../src/format';

describe('MySQL CREATE TABLE constraint alignment', () => {
  it('aligns table-level keys and constraints with the type column', () => {
    const sql = `CREATE TABLE users (
    id           BIGINT UNSIGNED       NOT NULL AUTO_INCREMENT,
    username     VARCHAR(64)           NOT NULL,
    email        VARCHAR(255)          NOT NULL,
    bio          TINYTEXT,
    description  MEDIUMTEXT,
    profile_html LONGTEXT,
    avatar       MEDIUMBLOB,
    role         ENUM('admin', 'editor', 'viewer')  NOT NULL DEFAULT 'viewer',
    tags         SET('featured', 'verified', 'premium'),
    status       TINYINT UNSIGNED      NOT NULL DEFAULT 1,
    login_count  INT UNSIGNED          NOT NULL DEFAULT 0,
    created_at   DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
                 UNIQUE KEY uk_username (username),
                 UNIQUE KEY uk_email (email),
    KEY idx_status (status),
    KEY idx_created (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE products (
    id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    sku            VARCHAR(32)     NOT NULL,
    name           VARCHAR(200)    NOT NULL,
    description    TEXT,
    price          DECIMAL(10, 2)  UNSIGNED NOT NULL,
    weight_kg      DECIMAL(8, 3),
    metadata       JSON,
    search_body    TEXT,
    name_norm      VARCHAR(200)
                                   GENERATED ALWAYS AS (LOWER(TRIM(name)))
                                   STORED,
    price_with_tax DECIMAL(12, 2)  GENERATED ALWAYS AS (price * 1.20) VIRTUAL,
    is_active      TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
                   UNIQUE KEY uk_sku (sku),
    FULLTEXT KEY ft_search (name, description, search_body),
    KEY idx_price (price),
    CHECK(price >= 0),
    CHECK(weight_kg IS NULL OR weight_kg > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;`;

    const expected = `CREATE TABLE users (
    id           BIGINT UNSIGNED       NOT NULL AUTO_INCREMENT,
    username     VARCHAR(64)           NOT NULL,
    email        VARCHAR(255)          NOT NULL,
    bio          TINYTEXT,
    description  MEDIUMTEXT,
    profile_html LONGTEXT,
    avatar       MEDIUMBLOB,
    role         ENUM('admin', 'editor', 'viewer')  NOT NULL DEFAULT 'viewer',
    tags         SET('featured', 'verified', 'premium'),
    status       TINYINT UNSIGNED      NOT NULL DEFAULT 1,
    login_count  INT UNSIGNED          NOT NULL DEFAULT 0,
    created_at   DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
                 PRIMARY KEY (id),
                 UNIQUE KEY uk_username (username),
                 UNIQUE KEY uk_email (email),
                 KEY idx_status (status),
                 KEY idx_created (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE products (
    id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    sku            VARCHAR(32)     NOT NULL,
    name           VARCHAR(200)    NOT NULL,
    description    TEXT,
    price          DECIMAL(10, 2)  UNSIGNED NOT NULL,
    weight_kg      DECIMAL(8, 3),
    metadata       JSON,
    search_body    TEXT,
    name_norm      VARCHAR(200)    GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED,
    price_with_tax DECIMAL(12, 2)  GENERATED ALWAYS AS (price * 1.20) VIRTUAL,
    is_active      TINYINT(1)      NOT NULL DEFAULT 1,
                   PRIMARY KEY (id),
                   UNIQUE KEY uk_sku (sku),
                   FULLTEXT KEY ft_search (name, description, search_body),
                   KEY idx_price (price),
                   CHECK(price >= 0),
                   CHECK(weight_kg IS NULL OR weight_kg > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;`;

    expect(formatSQL(sql, { dialect: 'mysql' }).trimEnd()).toBe(expected);
  });
});
