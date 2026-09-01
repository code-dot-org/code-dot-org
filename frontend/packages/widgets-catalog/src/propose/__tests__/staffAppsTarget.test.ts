import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

import {proposeStaffApps, type ProposeStaffAppsInput} from '../staffAppsTarget.js';
import type {WidgetDescriptorLike} from '../types.js';

const scratchDirs: string[] = [];
let savedHome: string | undefined;

afterEach(() => {
  for (const dir of scratchDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
  if (savedHome !== undefined) {
    process.env.HOME = savedHome;
    savedHome = undefined;
  }
});

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

/**
 * A local bare repo standing in for the real `codeai-staff-apps/widgets` —
 * `main` as its default branch (not `master`), one pre-existing widget under
 * `widgets/` plus a `widgets/manifest.json` indexing it, so this test
 * exercises real parentage (the new commit's parent really is this repo's
 * fetched tip), real collision checking, and a real manifest merge — not
 * just an empty repo.
 */
function makeStaffAppsRemote(): string {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'staff-apps-remote-work-'));
  scratchDirs.push(work);
  git(work, ['init', '--quiet']);
  git(work, ['config', 'user.email', 'test@example.com']);
  git(work, ['config', 'user.name', 'Test']);
  fs.mkdirSync(path.join(work, 'widgets', 'existing-widget'), {recursive: true});
  fs.writeFileSync(
    path.join(work, 'widgets', 'existing-widget', 'widget.html'),
    '<html>existing</html>\n',
  );
  fs.writeFileSync(
    path.join(work, 'widgets', 'manifest.json'),
    `${JSON.stringify({'existing-widget': {slug: 'existing-widget', version: '1.0.0'}}, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(work, 'README.md'), '# widgets\n');
  git(work, ['add', '-A']);
  git(work, ['commit', '--quiet', '-m', 'seed']);
  // Rename AFTER the first commit — an unborn branch's rename needs an
  // actual ref to exist first in this git version.
  git(work, ['branch', '-m', 'main']);

  const bareDir = fs.mkdtempSync(path.join(os.tmpdir(), 'staff-apps-remote-bare-'));
  scratchDirs.push(bareDir);
  git(bareDir, ['init', '--bare', '--quiet']);
  git(work, ['remote', 'add', 'bare', bareDir]);
  git(work, ['push', 'bare', 'main']);
  // A bare `init` leaves HEAD pointing at `init.defaultBranch` regardless of
  // what gets pushed later — set it explicitly, the way a real repo's
  // default branch always is.
  git(bareDir, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  return bareDir;
}

/** Rewrites `git@github.com:codeai-staff-apps/widgets.git` to `bareDir` for
 * every git invocation in this process (fetch, push, ls-remote all honor
 * `url.<base>.insteadOf`) — so a test can exercise the github.com URL
 * parsing (compare URL, PR owner/repo) end to end while every byte still
 * only ever travels to a local bare repo, never the network. Uses a
 * throwaway `$HOME/.gitconfig` rather than `GIT_CONFIG_GLOBAL` (introduced
 * in git 2.32) for portability to older git. */
function redirectGithubUrlTo(bareDir: string): void {
  savedHome = process.env.HOME;
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'staff-apps-gitconfig-'));
  scratchDirs.push(fakeHome);
  fs.writeFileSync(
    path.join(fakeHome, '.gitconfig'),
    // commit-tree in the scratch bare repo needs SOME identity — this
    // process's own $HOME is overridden for the duration of the test, so
    // it can no longer fall back to the real one.
    `[user]\n\temail = test@example.com\n\tname = Test\n` +
      `[url "${bareDir}"]\n\tinsteadOf = git@github.com:codeai-staff-apps/widgets.git\n`,
  );
  process.env.HOME = fakeHome;
}

const descriptor: WidgetDescriptorLike = {
  toolName: 'predict_the_trace',
  title: 'Predict the Trace',
  description: 'Two-item trace-prediction check.',
  inputSchema: {title: {type: 'string'}},
  visibility: ['model', 'app'],
  network: 'none',
  eventTypes: ['predicted', 'completed'],
};

function makeSessionSrcDir(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-widget-src-'));
  scratchDirs.push(dir);
  for (const [rel, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

function baseInput(
  remote: string,
  overrides: Partial<ProposeStaffAppsInput> = {},
): ProposeStaffAppsInput {
  return {
    target: 'staff-apps',
    mode: 'dry-run',
    sessionId: 'default',
    widgetId: 'draft-widget-253582fd',
    descriptor,
    violations: [],
    servedHtml: '<html><body>predict the trace</body></html>',
    sessionSrcDir: makeSessionSrcDir({
      'index.tsx': 'export default function Widget() { return null; }\n',
    }),
    srcFiles: [
      {path: 'index.tsx', content: 'export default function Widget() { return null; }\n'},
    ],
    toolchain: {esbuild: '0.25.12', componentLibrary: '0.1.0-alpha.1', widgetRuntime: '0.1.0'},
    authorshipTrail: [],
    chatTurns: [],
    remote,
    now: new Date('2026-08-28T00:00:00.000Z'),
    ...overrides,
  };
}

describe('proposeStaffApps', () => {
  it("dry-run: parents onto the remote's real default-branch tip, lays out widgets/<slug>/, and merges the manifest — without pushing", async () => {
    const remote = makeStaffAppsRemote();
    const remoteTipBefore = git(remote, ['rev-parse', 'main']);

    const result = await proposeStaffApps(baseInput(remote));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.target).toBe('staff-apps');
    expect(result.mode).toBe('dry-run');
    expect(result.slug).toBe('predict-the-trace');
    expect(result.branch).toBe('widget/predict-the-trace-v1.0.0');
    expect(result.baseCommit).toBe(remoteTipBefore);

    const paths = result.files.map(f => f.path).sort();
    expect(paths).toEqual([
      'widgets/manifest.json',
      'widgets/predict-the-trace/PROVENANCE.md',
      'widgets/predict-the-trace/src/index.tsx',
      'widgets/predict-the-trace/widget.html',
      'widgets/predict-the-trace/widget.json',
    ]);

    const widgetHtml = result.files.find(f => f.path.endsWith('widget.html'));
    expect(widgetHtml!.content).toBe('<html><body>predict the trace</body></html>');

    const manifestFile = result.files.find(f => f.path === 'widgets/manifest.json');
    const manifest = JSON.parse(manifestFile!.content) as Record<string, unknown>;
    // Merged: the remote's pre-existing entry survives alongside the new one.
    expect(Object.keys(manifest).sort()).toEqual(['existing-widget', 'predict-the-trace']);

    // Nothing was pushed: the remote's own tip has not moved, and no branch
    // for this proposal exists there.
    expect(git(remote, ['rev-parse', 'main'])).toBe(remoteTipBefore);
    expect(git(remote, ['branch', '-l'])).not.toContain('predict-the-trace');
  });

  it("refuses a slug collision against the remote's existing widgets/", async () => {
    const remote = makeStaffAppsRemote();
    const result = await proposeStaffApps(
      baseInput(remote, {descriptor: {...descriptor, toolName: 'existing_widget'}}),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain('existing-widget');
    expect(result.suggestion).toBe('existing-widget-2');
  });

  it('push against a plain (non-github) remote path pushes the branch with the right contents, and degrades to no compare/PR', async () => {
    const remote = makeStaffAppsRemote();
    const result = await proposeStaffApps(baseInput(remote, {mode: 'push', openPr: false}));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.mode).toBe('push');

    const branchTip = git(remote, ['rev-parse', `refs/heads/${result.branch}`]);
    expect(branchTip).toBe(result.commit);
    const filesOnBranch = git(remote, ['ls-tree', '-r', '--name-only', branchTip])
      .split('\n')
      .sort();
    expect(filesOnBranch).toEqual([
      'README.md',
      'widgets/existing-widget/widget.html',
      'widgets/manifest.json',
      'widgets/predict-the-trace/PROVENANCE.md',
      'widgets/predict-the-trace/src/index.tsx',
      'widgets/predict-the-trace/widget.html',
      'widgets/predict-the-trace/widget.json',
    ]);
    // A local bare path is not a github.com URL — no compare URL, no PR.
    expect(result.compareUrl).toBeUndefined();
    expect('prUrl' in result ? result.prUrl : undefined).toBeUndefined();
  });

  it('push against a github.com-shaped remote (redirected to a local bare repo) returns a compare URL and opens a PR via the injected gh dependency', async () => {
    const remote = makeStaffAppsRemote();
    redirectGithubUrlTo(remote);

    const runGh = () => 'https://github.com/codeai-staff-apps/widgets/pull/7\n';
    const result = await proposeStaffApps(
      baseInput('git@github.com:codeai-staff-apps/widgets.git', {
        mode: 'push',
        ghDeps: {ghAvailable: () => true, runGh},
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const branchTip = git(remote, ['rev-parse', `refs/heads/${result.branch}`]);
    expect(branchTip).toBe(result.commit);
    expect(result.compareUrl).toBe(
      'https://github.com/codeai-staff-apps/widgets/compare/main...widget/predict-the-trace-v1.0.0?expand=1',
    );
    expect(result.prUrl).toBe('https://github.com/codeai-staff-apps/widgets/pull/7');
    expect(result.prError).toBeUndefined();
  });

  it('a gh failure surfaces as prError alongside the still-successful push and compare URL', async () => {
    const remote = makeStaffAppsRemote();
    redirectGithubUrlTo(remote);

    const runGh = () => {
      throw new Error('gh: not authenticated');
    };
    const result = await proposeStaffApps(
      baseInput('git@github.com:codeai-staff-apps/widgets.git', {
        mode: 'push',
        ghDeps: {ghAvailable: () => true, runGh},
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.prUrl).toBeUndefined();
    expect(result.prError).toContain('not authenticated');
    expect(result.compareUrl).toBe(
      'https://github.com/codeai-staff-apps/widgets/compare/main...widget/predict-the-trace-v1.0.0?expand=1',
    );
  });
});
