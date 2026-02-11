export type DialectName = 'ansi' | 'postgres' | 'mysql' | 'tsql';

export type DialectStatementHandler =
  | { readonly kind: 'single_line_unsupported' }
  | { readonly kind: 'delimiter_script' }
  | { readonly kind: 'verbatim_unsupported'; readonly allowImplicitBoundary?: boolean }
  | { readonly kind: 'keyword_normalized_unsupported'; readonly allowImplicitBoundary?: boolean };

export interface DialectProfile {
  readonly name: DialectName;
  readonly keywords: ReadonlySet<string>;
  readonly functionKeywords: ReadonlySet<string>;
  readonly clauseKeywords: ReadonlySet<string>;
  readonly statementStarters: ReadonlySet<string>;
  readonly statementHandlers?: Readonly<Record<string, DialectStatementHandler>>;
}
