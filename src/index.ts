export { formatSQL } from './format';
export type { FormatOptions } from './format';
export { tokenize, TokenizeError } from './tokenizer';
export type { Token, TokenType } from './tokenizer';
export { Parser, parse, ParseError, MaxDepthError } from './parser';
export type { ParseOptions } from './parser';
export type * from './ast';

// Injected at build time by tsup's `define` option from package.json.
declare const __SQLFMT_VERSION__: string | undefined;
export const version: string =
  typeof __SQLFMT_VERSION__ !== 'undefined'
    ? __SQLFMT_VERSION__
    : '0.0.0-dev';
