# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Dedicated tokenizer, parser, error-path, CLI, API, and idempotency tests.
- CLI flags: `--version`/`-v`, `--write`/`-w`, and `--diff`.
- Public API exports for tokenizer/parser types and helpers.
- Formatter options (`FormatOptions`) with depth-limit support.

### Changed

- Tokenizer now supports dollar-quoted strings, positional parameters, scientific notation, hex numerics, prefixed strings, and Unicode identifiers.
- Parser now supports additional SQL syntax and stricter keyword/error handling.
- Formatter now handles additional expression nodes and alignment behaviors.
- CLI error handling and multi-file behavior were improved.

### Fixed

- Silent consumption of unterminated strings/comments/quoted identifiers.
- Multiple parser and formatter correctness gaps across common SQL dialect patterns.

## [1.1.1] - 2025-02-07

### Fixed

- Dynamic river width derivation for improved formatting of DML statements with wide keywords like `RETURNING`.
- Updated README with formatting details and examples.

## [1.1.0] - 2025-02-07

### Added

- Advanced SQL feature support: `GROUPING SETS`, `ROLLUP`, `CUBE`, `MERGE`, `TABLESAMPLE`, `FETCH FIRST`, `LATERAL`, and more.
- Comprehensive tests for advanced SQL features.

### Changed

- Tokenizer improvements for complex operators and syntax edge cases.
- New AST nodes and keywords for advanced SQL constructs.
- Expanded parser and formatter to handle advanced SQL statements and clauses.

## [1.0.1] - 2025-02-07

### Changed

- Migrated build process to tsup.
- Updated package name to `@vcoppola/sqlfmt` for npm publishing.
- Updated installation and import instructions.

## [1.0.0] - 2025-02-07

### Added

- Initial release.
- River-aligned SQL formatting based on the [Simon Holywell SQL Style Guide](https://www.sqlstyle.guide/).
- Tokenizer, parser, and formatter pipeline.
- CLI with `--check`, `--list-different`, `--ignore`, `--color`, glob pattern support.
- Library API with `formatSQL` function.
- Support for SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER TABLE, DROP TABLE, CREATE INDEX, CREATE VIEW, CTEs, window functions, CASE expressions, subqueries, and JOINs.
- PostgreSQL-specific syntax: casts (`::`), arrays, JSON/path operators, regex operators, dollar-quoting.
- Comment-aware formatting for line and block comments.
- `.sqlfmtignore` file support.
- Zero runtime dependencies.

[Unreleased]: https://github.com/vinsidious/sqlfmt/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/vinsidious/sqlfmt/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/vinsidious/sqlfmt/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/vinsidious/sqlfmt/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/vinsidious/sqlfmt/releases/tag/v1.0.0
