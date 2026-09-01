import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

import {proposeCatalog, type ProposeCatalogInput, type ProposeCatalogResult} from '../catalogTarget.js';
import {resolveRef} from '../gitPlumbing.js';
import type {WidgetDescriptorLike} from '../types.js';

function expectRefusal(
  result: ProposeCatalogResult,
): Extract<ProposeCatalogResult, {ok: false}> {
  expect(result.ok).toBe(false);
  return result as Extract<ProposeCatalogResult, {ok: false}>;
}

const scratchDirs: string[] = [];

afterEach(() => {
  for (const dir of scratchDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function makeRepo(): string {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'propose-repo-'));
  scratchDirs.push(repoRoot);
  git(repoRoot, ['init', '--quiet']);
  git(repoRoot, ['config', 'user.email', 'test@example.com']);
  git(repoRoot, ['config', 'user.name', 'Test']);
  fs.mkdirSync(path.join(repoRoot, 'frontend', 'packages', 'widgets-catalog'), {
    recursive: true,
  });
  fs.writeFileSync(path.join(repoRoot, 'README.md'), 'hello\n');
  git(repoRoot, ['add', '-A']);
  git(repoRoot, ['commit', '--quiet', '-m', 'initial']);
  return repoRoot;
}

function makeSessionSrcDir(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-widget-src-'));
  scratchDirs.push(dir);
  for (const [rel, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

const descriptor: WidgetDescriptorLike = {
  toolName: 'pick_your_blocks',
  title: 'Pick Your Blocks',
  description: 'Choose the right tool for the job.',
  inputSchema: {title: {type: 'string'}},
  visibility: ['model', 'app'],
  network: 'none',
  eventTypes: ['answered'],
};

function baseInput(overrides: Partial<ProposeCatalogInput> = {}): ProposeCatalogInput {
  const repoRoot = overrides.repoRoot ?? makeRepo();
  const sessionSrcDir =
    overrides.sessionSrcDir ??
    makeSessionSrcDir({
      'index.tsx': 'export default function Widget() { return null; }\n',
    });
  return {
    target: 'catalog',
    mode: 'dry-run',
    sessionId: 'default',
    widgetId: 'draft-widget-abc123',
    descriptor,
    violations: [],
    servedHtml: '<html><body>widget</body></html>',
    sessionSrcDir,
    srcFiles: [
      {path: 'index.tsx', content: 'export default function Widget() { return null; }\n'},
    ],
    toolchain: {esbuild: '0.25.12', componentLibrary: '0.1.0-alpha.1', widgetRuntime: '0.1.0'},
    existingSlugs: [],
    authorshipTrail: [],
    chatTurns: [],
    repoRoot,
    now: new Date('2026-08-28T00:00:00.000Z'),
    ...overrides,
  };
}

describe('proposeCatalog', () => {
  it('refuses a slug collision and suggests a numbered alternative, without touching git', () => {
    const repoRoot = makeRepo();
    const before = resolveRef(repoRoot, 'HEAD');
    const result = proposeCatalog(baseInput({repoRoot, existingSlugs: ['pick-your-blocks']}));
    const refusal = expectRefusal(result);
    expect(refusal.reason).toContain('pick-your-blocks');
    expect(refusal.suggestion).toBe('pick-your-blocks-2');
    expect(resolveRef(repoRoot, 'HEAD')).toBe(before);
  });

  it('refuses push mode with no remote specified', () => {
    const result = proposeCatalog(baseInput({mode: 'push'}));
    expect(expectRefusal(result).reason).toContain('remote');
  });

  it('dry-run: builds the commit, moves no ref, and returns the expected file map', () => {
    const repoRoot = makeRepo();
    const headBefore = resolveRef(repoRoot, 'HEAD');
    const result = proposeCatalog(baseInput({repoRoot, baseRef: 'HEAD'}));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.target).toBe('catalog');
    expect(result.mode).toBe('dry-run');
    expect(result.slug).toBe('pick-your-blocks');
    expect(result.version).toBe('1.0.0');
    expect(result.branch).toBe('widget-catalog/pick-your-blocks-v1.0.0');
    expect(result.baseCommit).toBe(headBefore);
    expect('compareUrl' in result).toBe(false);

    const paths = result.files.map(f => f.path).sort();
    expect(paths).toEqual([
      'frontend/packages/widgets-catalog/widgets/pick-your-blocks/CHANGELOG.md',
      'frontend/packages/widgets-catalog/widgets/pick-your-blocks/PROVENANCE.md',
      'frontend/packages/widgets-catalog/widgets/pick-your-blocks/src/index.tsx',
      'frontend/packages/widgets-catalog/widgets/pick-your-blocks/widget.json',
    ]);

    expect(resolveRef(repoRoot, 'HEAD')).toBe(headBefore);
    expect(git(repoRoot, ['status', '--porcelain'])).toBe('');

    const manifestFile = result.files.find(f => f.path.endsWith('widget.json'));
    const manifest = JSON.parse(manifestFile!.content);
    expect(manifest.slug).toBe('pick-your-blocks');
    expect(manifest.sourceHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(manifest.docHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(manifest.gates.violations).toEqual([]);

    const provenanceFile = result.files.find(f => f.path.endsWith('PROVENANCE.md'));
    expect(provenanceFile!.content).toContain('draft-widget-abc123');
    expect(provenanceFile!.content).toContain('default');
  });

  it('push mode pushes the built commit to the given remote and returns a compare URL when it recognizes the host', () => {
    const repoRoot = makeRepo();
    const bareRemote = fs.mkdtempSync(path.join(os.tmpdir(), 'propose-bare-'));
    scratchDirs.push(bareRemote);
    git(bareRemote, ['init', '--bare', '--quiet']);
    git(repoRoot, ['remote', 'add', 'fork', 'git@github.com:someuser/code-dot-org.git']);
    git(repoRoot, ['remote', 'add', 'local-bare', bareRemote]);

    const result = proposeCatalog(
      baseInput({repoRoot, mode: 'push', remote: 'local-bare', baseRef: 'HEAD'}),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const branchTip = git(bareRemote, ['rev-parse', `refs/heads/${result.branch}`]);
    expect(branchTip).toBe(result.commit);
    expect(result.compareUrl).toBeUndefined();
  });
});
