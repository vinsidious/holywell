/**
 * Node.js CLI smoke test — validates dist/cli.cjs behavior on Node 18/20/22.
 * Exit 0 = pass, exit 1 = fail.
 */

import { spawnSync } from 'child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const cliPath = fileURLToPath(new URL('../dist/cli.cjs', import.meta.url));

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures++;
  } else {
    console.log(`PASS: ${message}`);
  }
}

function runCli(args, cwd, input) {
  const proc = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    input,
    encoding: 'utf8',
  });
  return {
    code: proc.status ?? 1,
    out: proc.stdout ?? '',
    err: proc.stderr ?? '',
  };
}

// 1) Glob expansion should work on Node runtimes without fs.globSync.
{
  const dir = mkdtempSync(join(tmpdir(), 'holywell-node-cli-glob-'));
  try {
    mkdirSync(join(dir, 'nested'));
    writeFileSync(join(dir, 'a.sql'), 'select 1;', 'utf8');
    writeFileSync(join(dir, 'nested', 'b.sql'), 'select 2;', 'utf8');
    writeFileSync(join(dir, 'notes.txt'), 'keep me', 'utf8');

    const res = runCli(['--write', '**/*.sql'], dir);
    assert(res.code === 0, 'CLI expands **/*.sql globs');
    assert(readFileSync(join(dir, 'a.sql'), 'utf8') === 'SELECT 1;\n', 'CLI writes formatted top-level glob matches');
    assert(readFileSync(join(dir, 'nested', 'b.sql'), 'utf8') === 'SELECT 2;\n', 'CLI writes formatted nested glob matches');
    assert(readFileSync(join(dir, 'notes.txt'), 'utf8') === 'keep me', 'CLI does not touch non-matching files');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// 2) Writes through symlinked directories escaping CWD must be blocked.
{
  const outsideDir = mkdtempSync(join(tmpdir(), 'holywell-node-cli-outside-'));
  const workDir = mkdtempSync(join(tmpdir(), 'holywell-node-cli-work-'));
  try {
    const outsideFile = join(outsideDir, 'escaped.sql');
    writeFileSync(outsideFile, 'select 1;', 'utf8');
    symlinkSync(outsideDir, join(workDir, 'linked'));

    const res = runCli(['--write', 'linked/escaped.sql'], workDir);
    assert(res.code === 0, 'CLI exits cleanly when blocked write path is encountered');
    assert(res.err.includes('path resolves outside working directory'), 'CLI warns when symlinked directory escapes CWD');
    assert(readFileSync(outsideFile, 'utf8') === 'select 1;', 'CLI does not modify escaped symlink targets');
  } finally {
    rmSync(workDir, { recursive: true, force: true });
    rmSync(outsideDir, { recursive: true, force: true });
  }
}

// 3) Explicit missing config must fail loudly.
{
  const dir = mkdtempSync(join(tmpdir(), 'holywell-node-cli-config-'));
  try {
    writeFileSync(join(dir, 'q.sql'), 'SELECT 1;\n', 'utf8');
    const res = runCli(['--config', 'missing.json', 'q.sql'], dir);
    assert(res.code === 3, 'CLI returns usage/I/O error for missing explicit --config');
    assert(res.err.includes('Config file not found'), 'CLI prints explicit missing-config error');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log(`\n${failures === 0 ? 'All tests passed' : `${failures} test(s) failed`}`);
process.exit(failures === 0 ? 0 : 1);
