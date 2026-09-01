import path from 'node:path';

/**
 * `widgets:propose`'s argument shape, parsed out of `process.argv` — kept
 * pure (no `process.exit`, no filesystem access) so the CLI's argument
 * handling is unit-testable without actually running a propose.
 */
export interface ProposeCliArgs {
  widgetRef: string;
  target: 'catalog' | 'staff-apps';
  mode: 'dry-run' | 'push';
  remote?: string;
  sessionDir: string;
  openPr: boolean;
}

export type ParseArgsResult =
  | {ok: true; args: ProposeCliArgs}
  | {ok: false; error: string};

const USAGE =
  'usage: widgets:propose <widget-id-or-slug> --target catalog|staff-apps ' +
  '--mode dry-run|push [--remote <url>] [--session <path>] [--open-pr]';

/** `--session` (when given) resolves against `cwd`, matching a shell's own
 * relative-path convention; the default resolves against `frontendRoot`
 * regardless of `cwd`, since a widget session always lives under
 * `frontend/.authoring/sessions/`. */
export function parseProposeArgs(
  argv: string[],
  frontendRoot: string,
  cwd: string,
): ParseArgsResult {
  const positional: string[] = [];
  let target: string | undefined;
  let mode: string | undefined;
  let remote: string | undefined;
  let sessionDir: string | undefined;
  let openPr = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--target') {
      target = argv[++i];
    } else if (arg === '--mode') {
      mode = argv[++i];
    } else if (arg === '--remote') {
      remote = argv[++i];
    } else if (arg === '--session') {
      sessionDir = argv[++i];
    } else if (arg === '--open-pr') {
      openPr = true;
    } else {
      positional.push(arg);
    }
  }

  if (positional.length !== 1) {
    return {ok: false, error: USAGE};
  }
  if (target !== 'catalog' && target !== 'staff-apps') {
    return {
      ok: false,
      error: `--target must be "catalog" or "staff-apps", got ${target ?? '(none)'}`,
    };
  }
  if (mode !== 'dry-run' && mode !== 'push') {
    return {
      ok: false,
      error: `--mode must be "dry-run" or "push", got ${mode ?? '(none)'}`,
    };
  }

  return {
    ok: true,
    args: {
      widgetRef: positional[0],
      target,
      mode,
      remote,
      sessionDir: sessionDir
        ? path.resolve(cwd, sessionDir)
        : path.join(frontendRoot, '.authoring', 'sessions', 'default'),
      openPr,
    },
  };
}
