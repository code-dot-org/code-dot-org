import {
  BatchInfo,
  ClassicRunner,
  Configuration,
  Eyes,
  StitchMode,
  Target,
} from '@applitools/eyes-playwright';
import type {Driver} from '@applitools/eyes-playwright';
import type {Page} from '@playwright/test';
import {execSync} from 'node:child_process';

/**
 * Match timeout that the legacy Ruby Eyes steps overrode from the Applitools
 * default of 2s. Keep parity with `MATCH_TIMEOUT = 5` in eyes_steps.rb.
 */
const MATCH_TIMEOUT_MS = 5000;

/**
 * Legacy Chrome viewport used by Cucumber Eyes baselines on the `test`
 * branch. Baselines exist there today; matching this viewport lets the
 * Playwright suite reuse them without rebaselining.
 */
const LEGACY_VIEWPORT = {width: 1024, height: 690};

/**
 * Public Eyes API exposed to tests. Implemented either by the live
 * Applitools-backed adapter (when an API key is present) or by a no-op stub
 * (when no key is set). Method names mirror the Cucumber step verbs:
 *
 *   `I open my eyes to test "X"`                          → open
 *   `I see no difference for "X"`                         → check
 *   `I see no difference for "X" in the current viewport` → checkViewport
 *   `I see no difference for "X" within "<selector>"`     → checkRegion
 */
export interface EyesFixture {
  /**
   * Open an Applitools session with the given Cucumber test name. The name
   * is the string from the legacy `I open my eyes to test "X"` step — pass
   * it verbatim so the Cucumber baselines on the `test` branch match.
   * Optional; first `check` call will auto-open with the Playwright test
   * title if `open` was not called.
   */
  open(cucumberTestName: string): Promise<void>;
  /** Full-page visual checkpoint. Equivalent to Cucumber `I see no difference for "X"`. */
  check(name: string): Promise<void>;
  /** Viewport-only visual checkpoint. Equivalent to `... in the current viewport`. */
  checkViewport(name: string): Promise<void>;
  /**
   * Region visual checkpoint, scoped to the given CSS selector. Equivalent
   * to Cucumber `... within "<selector>"` — pass the same selector string
   * the legacy step used.
   */
  checkRegion(selector: string, name: string): Promise<void>;
}

/**
 * Build the per-test Applitools `Configuration`. Pulled out so the
 * branch/parent-branch/batch metadata is built once per test and surfaced
 * via env vars from CI.
 */
function buildConfiguration(apiKey: string): Configuration {
  const config = new Configuration();
  config.setApiKey(apiKey);

  const batchName = process.env.APPLITOOLS_BATCH_NAME ?? 'apps-e2e-tests';
  const batch = new BatchInfo({name: batchName});
  if (process.env.APPLITOOLS_BATCH_ID) {
    batch.setId(process.env.APPLITOOLS_BATCH_ID);
  }
  config.setBatch(batch);

  const branchName = process.env.APPLITOOLS_BRANCH ?? detectGitBranch();
  if (branchName) {
    config.setBranchName(branchName);
  }
  config.setParentBranchName(process.env.APPLITOOLS_PARENT_BRANCH ?? 'test');

  config.setMatchTimeout(MATCH_TIMEOUT_MS);
  config.setStitchMode(StitchMode.CSS);

  return config;
}

/**
 * Best-effort detection of the local git branch. Returns undefined inside
 * containers without git or when not in a checkout — the caller falls back
 * to whatever Applitools default applies (typically `master`).
 */
function detectGitBranch(): string | undefined {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
}

/**
 * No-op fixture used when `APPLITOOLS_API_KEY` is not set. Lets the
 * functional flow of `@eyes` tests run to completion in local dev without
 * Applitools billing — mirrors `CDO.disable_all_eyes_running` from the
 * legacy Ruby Eyes steps.
 */
const NOOP_EYES: EyesFixture = {
  open: async () => undefined,
  check: async () => undefined,
  checkViewport: async () => undefined,
  checkRegion: async () => undefined,
};

/**
 * Test fixture extension to drive Eyes lifecycle from the per-test fixture
 * teardown. `close` runs at end-of-test and is fail-fast on diff.
 */
export interface EyesHandle extends EyesFixture {
  /**
   * Close any open Applitools session. Throws on visual diff (fail-fast).
   * Always safe to call — no-op if no session was opened.
   */
  close(): Promise<void>;
}

/**
 * Construct an `EyesHandle` bound to the given Playwright `page` and the
 * Playwright test title. The Playwright title is only used as a fallback
 * test name when the test does not call `open(...)` first; for baseline
 * reuse from the Cucumber `test` branch, tests SHOULD call `open` with the
 * exact string the legacy `I open my eyes to test "X"` step used.
 *
 * `appName` defaults to `'Code.org'` — matches the legacy Ruby config
 * (`app_name: 'Code.org'`) so baselines carry over across the migration.
 *
 * When no API key is set the returned handle is a no-op; the functional
 * flow of the test runs unchanged.
 */
export function createEyesHandle(
  page: Page,
  fallbackTestName: string,
  appName = 'Code.org',
): EyesHandle {
  const apiKey = process.env.APPLITOOLS_API_KEY;
  if (!apiKey) {
    return {...NOOP_EYES, close: async () => undefined};
  }

  const runner = new ClassicRunner();
  const eyes = new Eyes(runner, buildConfiguration(apiKey));
  let opened = false;
  let explicitTestName: string | undefined;

  /**
   * Open the Applitools session. Resizes the page viewport to the legacy
   * Cucumber Chrome viewport (1024x690) so baselines line up with the
   * existing Cucumber-side baselines on the `test` branch.
   *
   * The Eyes SDK bundles its own copy of playwright-core, so its `Driver`
   * type is structurally identical but nominally distinct from the
   * `@playwright/test` Page type. Cast at the boundary; identical at
   * runtime.
   */
  async function openSession(testName: string): Promise<void> {
    if (opened) return;
    await eyes.open(
      page as unknown as Driver,
      appName,
      testName,
      LEGACY_VIEWPORT,
    );
    opened = true;
  }

  async function ensureOpen(): Promise<void> {
    if (opened) return;
    await openSession(explicitTestName ?? fallbackTestName);
  }

  return {
    async open(cucumberTestName) {
      explicitTestName = cucumberTestName;
      await openSession(cucumberTestName);
    },
    async check(name) {
      await ensureOpen();
      await eyes.check(name, Target.window().fully());
    },
    async checkViewport(name) {
      await ensureOpen();
      await eyes.check(name, Target.window());
    },
    async checkRegion(selector, name) {
      await ensureOpen();
      await eyes.check(name, Target.region(selector).fully());
    },
    async close() {
      if (!opened) return;
      try {
        await eyes.close(true);
      } finally {
        await eyes.abortIfNotClosed();
      }
    },
  };
}
