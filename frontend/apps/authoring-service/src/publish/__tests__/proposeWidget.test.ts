import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

import type {WidgetDescriptor} from '../../authoring/model.js';
import type {CurriculumSnapshot} from '../../store/SessionStore.js';
import {resolveRef} from '../gitPlumbing.js';
import {
  findWidgetReference,
  proposeWidget,
  type ProposeWidgetInput,
  type ProposeWidgetResult,
} from '../proposeWidget.js';

/** Asserts a refusal and returns it narrowed, so callers can assert on `reason`/`violations`/`suggestion` without an `if` around `expect` (vitest/no-conditional-expect). */
function expectRefusal(
  result: ProposeWidgetResult,
): Extract<ProposeWidgetResult, {ok: false}> {
  expect(result.ok).toBe(false);
  return result as Extract<ProposeWidgetResult, {ok: false}>;
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

const descriptor: WidgetDescriptor = {
  id: 'draft-widget-abc123',
  toolName: 'pick_your_blocks',
  title: 'Pick Your Blocks',
  description: 'Choose the right tool for the job.',
  inputSchema: {title: {type: 'string'}},
  resourceUri: 'ui://widgets/draft-widget-abc123.html',
  visibility: ['model', 'app'],
  network: 'none',
  eventTypes: ['answered'],
};

function baseInput(
  overrides: Partial<ProposeWidgetInput> = {},
): ProposeWidgetInput {
  const repoRoot = overrides.repoRoot ?? makeRepo();
  const sessionSrcDir =
    overrides.sessionSrcDir ??
    makeSessionSrcDir({
      'index.tsx': 'export default function Widget() { return null; }\n',
    });
  return {
    mode: 'dry-run',
    sessionId: 'default',
    widgetId: 'draft-widget-abc123',
    descriptor,
    violations: [],
    servedHtml: '<html><body>widget</body></html>',
    sessionSrcDir,
    srcFiles: [
      {
        path: 'index.tsx',
        content: 'export default function Widget() { return null; }\n',
      },
    ],
    toolchain: {
      esbuild: '0.25.12',
      componentLibrary: '0.1.0-alpha.1',
      widgetRuntime: '0.1.0',
    },
    existingSlugs: [],
    authorshipTrail: [],
    chatTurns: [],
    repoRoot,
    now: new Date('2026-08-28T00:00:00.000Z'),
    ...overrides,
  };
}

describe('proposeWidget', () => {
  it('refuses on a contract-gate violation, without touching git at all', () => {
    const repoRoot = makeRepo();
    const before = resolveRef(repoRoot, 'HEAD');
    const result = proposeWidget(
      baseInput({
        repoRoot,
        violations: ['found a <script src="https://evil.example">'],
      }),
    );
    const refusal = expectRefusal(result);
    expect(refusal.reason).toContain('contract gate');
    expect(refusal.violations).toEqual([
      'found a <script src="https://evil.example">',
    ]);
    expect(resolveRef(repoRoot, 'HEAD')).toBe(before);
  });

  it('refuses a slug collision and suggests a numbered alternative, without touching git', () => {
    const repoRoot = makeRepo();
    const before = resolveRef(repoRoot, 'HEAD');
    const result = proposeWidget(
      baseInput({repoRoot, existingSlugs: ['pick-your-blocks']}),
    );
    const refusal = expectRefusal(result);
    expect(refusal.reason).toContain('pick-your-blocks');
    expect(refusal.suggestion).toBe('pick-your-blocks-2');
    expect(resolveRef(repoRoot, 'HEAD')).toBe(before);
  });

  it('refuses push mode with no remote specified', () => {
    const result = proposeWidget(baseInput({mode: 'push'}));
    expect(expectRefusal(result).reason).toContain('remote');
  });

  it('dry-run: builds the commit, moves no ref, and returns the expected file map', () => {
    const repoRoot = makeRepo();
    const headBefore = resolveRef(repoRoot, 'HEAD');
    const result = proposeWidget(baseInput({repoRoot, baseRef: 'HEAD'}));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
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

    // Nothing moved: HEAD is unchanged, and the new commit only exists as a
    // dangling git object until/unless something points at it.
    expect(resolveRef(repoRoot, 'HEAD')).toBe(headBefore);
    expect(git(repoRoot, ['status', '--porcelain'])).toBe('');

    const manifestFile = result.files.find(f => f.path.endsWith('widget.json'));
    const manifest = JSON.parse(manifestFile!.content);
    expect(manifest.slug).toBe('pick-your-blocks');
    expect(manifest.sourceHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(manifest.docHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(manifest.gates.violations).toEqual([]);

    const provenanceFile = result.files.find(f =>
      f.path.endsWith('PROVENANCE.md'),
    );
    expect(provenanceFile!.content).toContain('draft-widget-abc123');
    expect(provenanceFile!.content).toContain('default');
  });

  it('push mode pushes the built commit to the given remote and returns a compare URL when it recognizes the host', () => {
    const repoRoot = makeRepo();
    const bareRemote = fs.mkdtempSync(path.join(os.tmpdir(), 'propose-bare-'));
    scratchDirs.push(bareRemote);
    git(bareRemote, ['init', '--bare', '--quiet']);
    git(repoRoot, [
      'remote',
      'add',
      'fork',
      'git@github.com:someuser/code-dot-org.git',
    ]);
    git(repoRoot, ['remote', 'add', 'local-bare', bareRemote]);

    const result = proposeWidget(
      baseInput({
        repoRoot,
        mode: 'push',
        remote: 'local-bare',
        baseRef: 'HEAD',
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const branchTip = git(bareRemote, [
      'rev-parse',
      `refs/heads/${result.branch}`,
    ]);
    expect(branchTip).toBe(result.commit);
    // 'local-bare' isn't a github.com URL, so no compare URL is guessable —
    // proves the endpoint degrades rather than fabricating a broken link.
    expect(result.compareUrl).toBeUndefined();
  });
});

describe('findWidgetReference', () => {
  function snapshotWithWidget(widgetId: string): CurriculumSnapshot {
    return {
      version: 1,
      widgets: [],
      levelProperties: {},
      courses: [
        {
          id: 'course-1',
          displayName: 'Course One',
          origin: 'draft',
          units: [
            {
              id: 'unit-1',
              displayName: 'Unit One',
              origin: 'draft',
              lessons: [
                {
                  id: 'lesson-1',
                  displayName: 'Lesson One',
                  origin: 'draft',
                  experiences: [
                    {
                      id: 'exp-1',
                      origin: 'draft',
                      kind: 'widget',
                      widgetId,
                      toolName: 'pick_your_blocks',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  it('finds the course/unit/lesson/experience referencing a widget', () => {
    const ref = findWidgetReference(
      snapshotWithWidget('draft-widget-abc123'),
      'draft-widget-abc123',
    );
    expect(ref).toEqual({
      courseId: 'course-1',
      courseName: 'Course One',
      unitId: 'unit-1',
      unitName: 'Unit One',
      lessonId: 'lesson-1',
      lessonName: 'Lesson One',
      experienceId: 'exp-1',
    });
  });

  it('returns undefined for a widget no experience references', () => {
    const ref = findWidgetReference(
      snapshotWithWidget('some-other-widget'),
      'draft-widget-abc123',
    );
    expect(ref).toBeUndefined();
  });
});
