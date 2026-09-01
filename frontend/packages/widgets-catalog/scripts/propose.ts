#!/usr/bin/env tsx
// Graduates a session widget into a real pull request without a running
// authoring service — the same propose flow the service's HTTP endpoint
// wraps (src/propose/propose.ts), reading the session store's files
// directly instead of through the service's in-memory state.
//
// Usage:
//   yarn widgets:propose <widget-id-or-slug> --target catalog|staff-apps \
//     --mode dry-run|push [--remote <url>] [--session <path>] [--open-pr]
//
// --session defaults to frontend/.authoring/sessions/default. --remote
// defaults to AUTHORING_PROPOSE_REMOTE (catalog) or
// AUTHORING_PROPOSE_STAFF_APPS_REMOTE (staff-apps) when not passed
// explicitly. --open-pr is opt-in: without it, a staff-apps push stops at
// the pushed branch and its compare URL, same as the catalog target always
// does — a CLI invocation should not open a real pull request unless asked.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {injectWidgetChrome} from '@code-dot-org/widget-runtime/chrome';

import {listWidgetSlugs} from '../src/buildCatalog.js';
import {checkWidgetDocument} from '../src/contractGates.js';
import {parseProposeArgs} from '../src/propose/cliArgs.js';
import {proposeWidget, type ProposeWidgetInput} from '../src/propose/propose.js';
import {
  filterAuthorshipTrail,
  filterChatTurns,
  findWidgetReference,
} from '../src/propose/provenance.js';
import {readSrcFiles} from '../src/propose/srcFiles.js';
import type {
  ChangeLike,
  ChatTurnLike,
  CurriculumSnapshotLike,
  WidgetDescriptorLike,
} from '../src/propose/types.js';
import {computeToolchain} from '../src/toolchain.js';

const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const FRONTEND_ROOT = path.resolve(PACKAGE_ROOT, '..', '..');
const REPO_ROOT = path.resolve(FRONTEND_ROOT, '..');

function die(message: string): never {
  console.error(`[widgets:propose] ${message}`);
  process.exit(1);
}

function readJson<T>(filePath: string): T | undefined {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function readJsonLines<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => JSON.parse(line) as T);
}

/** `<widget-id-or-slug>` resolution: an exact session widget directory name
 * first, else the first widget whose `toolName` (or its minted slug)
 * matches — so a human does not have to remember `draft-widget-c7917dd5`
 * to propose "pick your blocks". */
function resolveWidgetId(sessionDir: string, widgetRef: string): string {
  const widgetsDir = path.join(sessionDir, 'widgets');
  const exactDir = path.join(widgetsDir, widgetRef);
  if (fs.existsSync(path.join(exactDir, 'meta.json'))) {
    return widgetRef;
  }
  const entries = fs.existsSync(widgetsDir)
    ? fs.readdirSync(widgetsDir, {withFileTypes: true})
    : [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const descriptor = readJson<WidgetDescriptorLike>(
      path.join(widgetsDir, entry.name, 'meta.json'),
    );
    if (!descriptor) continue;
    const slug = descriptor.toolName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (descriptor.toolName === widgetRef || slug === widgetRef) {
      return entry.name;
    }
  }
  die(`no session widget found matching "${widgetRef}" under ${widgetsDir}`);
}

async function main(): Promise<void> {
  const parsed = parseProposeArgs(process.argv.slice(2), FRONTEND_ROOT, process.cwd());
  if (!parsed.ok) {
    die(parsed.error);
  }
  const args = parsed.args;
  const widgetId = resolveWidgetId(args.sessionDir, args.widgetRef);
  const widgetDir = path.join(args.sessionDir, 'widgets', widgetId);

  const descriptor = readJson<WidgetDescriptorLike>(
    path.join(widgetDir, 'meta.json'),
  );
  if (!descriptor) {
    die(`${widgetDir}/meta.json is missing`);
  }
  const srcDir = path.join(widgetDir, 'src');
  if (!fs.existsSync(path.join(srcDir, 'index.tsx'))) {
    die(
      `${widgetId} has no src/index.tsx — only a built (TSX source) widget can be proposed`,
    );
  }
  const rawHtml = fs.readFileSync(path.join(widgetDir, 'widget.html'), 'utf8');
  const servedHtml = injectWidgetChrome(rawHtml);
  const violations = checkWidgetDocument(servedHtml);

  const changes = readJsonLines<ChangeLike>(
    path.join(args.sessionDir, 'changes.jsonl'),
  );
  const chatLog = readJsonLines<ChatTurnLike>(
    path.join(args.sessionDir, 'chat.jsonl'),
  );
  const snapshot = readJson<CurriculumSnapshotLike>(
    path.join(args.sessionDir, 'curriculum.json'),
  ) ?? {courses: []};
  const reference = findWidgetReference(snapshot, widgetId);
  const authorshipTrail = filterAuthorshipTrail(changes, widgetId);
  const chatTurns = filterChatTurns(chatLog, reference);

  const common = {
    mode: args.mode,
    sessionId: path.basename(args.sessionDir),
    widgetId,
    descriptor,
    violations,
    servedHtml,
    sessionSrcDir: srcDir,
    srcFiles: readSrcFiles(srcDir),
    toolchain: computeToolchain(),
    authorshipTrail,
    chatTurns,
    reference,
  };

  let input: ProposeWidgetInput;
  if (args.target === 'catalog') {
    const remote = args.remote ?? process.env.AUTHORING_PROPOSE_REMOTE;
    if (args.mode === 'push' && !remote) {
      die('--remote (or AUTHORING_PROPOSE_REMOTE) is required for --mode push');
    }
    input = {
      ...common,
      target: 'catalog',
      repoRoot: REPO_ROOT,
      existingSlugs: listWidgetSlugs(),
      remote,
    };
  } else {
    const remote = args.remote ?? process.env.AUTHORING_PROPOSE_STAFF_APPS_REMOTE;
    if (!remote) {
      die(
        '--remote (or AUTHORING_PROPOSE_STAFF_APPS_REMOTE) is required for --target staff-apps',
      );
    }
    input = {
      ...common,
      target: 'staff-apps',
      remote,
      openPr: args.openPr,
    };
  }

  const result = await proposeWidget(input);
  if (!result.ok) {
    console.error(`[widgets:propose] refused: ${result.reason}`);
    if (result.violations?.length) {
      for (const v of result.violations) console.error(`  - ${v}`);
    }
    if (result.suggestion) {
      console.error(`  suggestion: ${result.suggestion}`);
    }
    process.exit(1);
  }

  console.log(`[widgets:propose] ${result.target}/${result.slug} v${result.version}`);
  console.log(`  branch: ${result.branch}`);
  console.log(`  base:   ${result.baseCommit}`);
  console.log(`  commit: ${result.commit}`);
  console.log(`  files (${result.files.length}):`);
  for (const file of result.files) {
    console.log(`    ${file.path}`);
  }
  console.log('');
  console.log(result.diffstat);
  if (result.mode === 'dry-run') {
    console.log('[widgets:propose] dry-run only — nothing was pushed.');
  } else {
    if ('prUrl' in result && result.prUrl) {
      console.log(`[widgets:propose] pull request opened: ${result.prUrl}`);
    } else if ('compareUrl' in result && result.compareUrl) {
      console.log(`[widgets:propose] pushed. Open a PR: ${result.compareUrl}`);
    } else {
      console.log('[widgets:propose] pushed.');
    }
    if ('prError' in result && result.prError) {
      console.log(`[widgets:propose] PR creation failed: ${result.prError}`);
    }
  }
}

await main();
