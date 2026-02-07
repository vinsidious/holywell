export { formatSQL } from './format';
export type { FormatOptions } from './format';
export { tokenize, TokenizeError } from './tokenizer';
export { Parser, parse, ParseError, MaxDepthError } from './parser';
export type * from './ast';

// Injected at build time by tsup's `define` option from package.json.
// Falls back to reading package.json directly when running from source (e.g. bun test).
declare const __SQLFMT_VERSION__: string | undefined;
export const version: string =
  typeof __SQLFMT_VERSION__ !== 'undefined'
    ? __SQLFMT_VERSION__
    : (() => {
        try {
          const { readFileSync } = require('fs');
          const { join } = require('path');
          return JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')).version;
        } catch {
          return '0.0.0';
        }
      })();
