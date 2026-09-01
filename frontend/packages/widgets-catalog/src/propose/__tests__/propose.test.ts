import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

import type {ProposeCatalogInput} from '../catalogTarget.js';
import {proposeWidget} from '../propose.js';
import type {WidgetDescriptorLike} from '../types.js';

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
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'propose-dispatch-repo-'));
  scratchDirs.push(repoRoot);
  git(repoRoot, ['init', '--quiet']);
  git(repoRoot, ['config', 'user.email', 'test@example.com']);
  git(repoRoot, ['config', 'user.name', 'Test']);
  fs.writeFileSync(path.join(repoRoot, 'README.md'), 'hello\n');
  git(repoRoot, ['add', '-A']);
  git(repoRoot, ['commit', '--quiet', '-m', 'initial']);
  return repoRoot;
}

const descriptor: WidgetDescriptorLike = {
  toolName: 'pick_your_blocks',
  title: 'Pick Your Blocks',
  description: 'Choose the right tool for the job.',
  inputSchema: {},
  visibility: ['model', 'app'],
  network: 'none',
};

function catalogInput(overrides: Partial<ProposeCatalogInput> = {}): ProposeCatalogInput {
  const repoRoot = overrides.repoRoot ?? makeRepo();
  return {
    target: 'catalog',
    mode: 'dry-run',
    sessionId: 'default',
    widgetId: 'draft-widget-abc',
    descriptor,
    violations: [],
    servedHtml: '<html></html>',
    sessionSrcDir: fs.mkdtempSync(path.join(os.tmpdir(), 'propose-dispatch-src-')),
    srcFiles: [],
    toolchain: {esbuild: '0.25.12', componentLibrary: '0.1.0-alpha.1', widgetRuntime: '0.1.0'},
    existingSlugs: [],
    authorshipTrail: [],
    chatTurns: [],
    repoRoot,
    baseRef: 'HEAD',
    now: new Date('2026-08-28T00:00:00.000Z'),
    ...overrides,
  };
}

describe('proposeWidget (target dispatch)', () => {
  it('refuses uniformly on a contract-gate violation before dispatching to any target', async () => {
    const repoRoot = makeRepo();
    const result = await proposeWidget(
      catalogInput({repoRoot, violations: ['found a <script src="https://evil.example">']}),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain('contract gate');
    expect(result.violations).toEqual(['found a <script src="https://evil.example">']);
  });

  it('dispatches target: catalog to proposeCatalog', async () => {
    const result = await proposeWidget(catalogInput());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.target).toBe('catalog');
    expect(result.branch).toContain('widget-catalog/');
  });
});
