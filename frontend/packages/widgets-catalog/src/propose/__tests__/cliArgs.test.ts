import path from 'node:path';
import {describe, expect, it} from 'vitest';

import {parseProposeArgs} from '../cliArgs.js';

const FRONTEND_ROOT = '/repo/frontend';
const CWD = '/repo/frontend/packages/widgets-catalog';

describe('parseProposeArgs', () => {
  it('parses target/mode/remote/open-pr and defaults the session dir', () => {
    const result = parseProposeArgs(
      ['predict-the-trace', '--target', 'staff-apps', '--mode', 'push', '--remote', 'git@github.com:codeai-staff-apps/widgets.git', '--open-pr'],
      FRONTEND_ROOT,
      CWD,
    );
    expect(result).toEqual({
      ok: true,
      args: {
        widgetRef: 'predict-the-trace',
        target: 'staff-apps',
        mode: 'push',
        remote: 'git@github.com:codeai-staff-apps/widgets.git',
        sessionDir: path.join(FRONTEND_ROOT, '.authoring', 'sessions', 'default'),
        openPr: true,
      },
    });
  });

  it('defaults openPr to false and remote to undefined when omitted', () => {
    const result = parseProposeArgs(
      ['pick-your-blocks', '--target', 'catalog', '--mode', 'dry-run'],
      FRONTEND_ROOT,
      CWD,
    );
    expect(result).toEqual({
      ok: true,
      args: {
        widgetRef: 'pick-your-blocks',
        target: 'catalog',
        mode: 'dry-run',
        remote: undefined,
        sessionDir: path.join(FRONTEND_ROOT, '.authoring', 'sessions', 'default'),
        openPr: false,
      },
    });
  });

  it('resolves --session against cwd, not frontendRoot', () => {
    const result = parseProposeArgs(
      ['w', '--target', 'catalog', '--mode', 'dry-run', '--session', '../other-session'],
      FRONTEND_ROOT,
      CWD,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.args.sessionDir).toBe(path.resolve(CWD, '../other-session'));
  });

  it('rejects a missing or extra positional argument', () => {
    expect(parseProposeArgs(['--target', 'catalog', '--mode', 'dry-run'], FRONTEND_ROOT, CWD).ok).toBe(false);
    expect(
      parseProposeArgs(['a', 'b', '--target', 'catalog', '--mode', 'dry-run'], FRONTEND_ROOT, CWD).ok,
    ).toBe(false);
  });

  it('rejects an invalid --target', () => {
    const result = parseProposeArgs(['w', '--target', 'nope', '--mode', 'dry-run'], FRONTEND_ROOT, CWD);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('--target');
  });

  it('rejects an invalid --mode', () => {
    const result = parseProposeArgs(['w', '--target', 'catalog', '--mode', 'nope'], FRONTEND_ROOT, CWD);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('--mode');
  });

  it('rejects missing --target/--mode entirely', () => {
    expect(parseProposeArgs(['w'], FRONTEND_ROOT, CWD).ok).toBe(false);
  });
});
