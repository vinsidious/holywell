import { describe, expect, it } from 'bun:test';
import { join } from 'path';

const root = join(import.meta.dir, '..');
const cliPath = join(root, 'src', 'cli.ts');
const bunPath = process.execPath;
const decoder = new TextDecoder();

function runCliWithStdin(args: string[], stdinContent: string) {
  const proc = Bun.spawnSync({
    cmd: [bunPath, cliPath, ...args],
    cwd: root,
    stdin: new TextEncoder().encode(stdinContent),
    stdout: 'pipe',
    stderr: 'pipe',
    env: process.env,
  });

  return {
    code: proc.exitCode,
    out: decoder.decode(proc.stdout),
    err: decoder.decode(proc.stderr),
  };
}

describe('CLI stdout and stderr separation', () => {
  it('writes formatted SQL to stdout without prepending diagnostic warnings', () => {
    const res = runCliWithStdin([], 'select 1;');

    expect(res.code).toBe(0);
    expect(res.out).toBe('SELECT 1;\n');
    expect(res.out).not.toContain('Warning:');
    expect(res.out).not.toContain('npm warn');
    expect(res.err).toBe('');
  });

  it('keeps parser recovery warnings on stderr instead of stdout', () => {
    const res = runCliWithStdin([], 'SELECT (');

    expect(res.code).toBe(2);
    expect(res.out).toBe('SELECT (\n');
    expect(res.out).not.toContain('Warning:');
    expect(res.err).toContain('Warning: statement 1/1 could not be parsed and was passed through as-is');
  });
});
