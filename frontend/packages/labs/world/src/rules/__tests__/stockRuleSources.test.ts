// The committed workspaces must match what their sources generate.
//
// Five of the stock rules are maintained as modules under `scripts/rules/` and
// generated into `src/rules/stock/*.ts`; the generated file is committed, so a
// reader sees what ships and nothing changes at run time. That arrangement is
// only safe if the two cannot drift — a generator whose output can be edited
// behind its back is worse than no generator, because the source stops being
// the truth and nobody finds out until the next regeneration silently reverts
// somebody's fix.
//
// So: regenerate in memory and compare. This is the whole of what keeps
// "never work backward" true.

import {execFileSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';

describe('the generated stock rules', () => {
  it('match their sources', () => {
    // `--check` writes nothing and exits non-zero on the first stale one.
    const run = () =>
      execFileSync('node', ['scripts/build-stock-rules.mjs', '--check'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });

    expect(run).not.toThrow();
  });
});
