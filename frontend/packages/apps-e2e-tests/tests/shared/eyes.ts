import {
  BatchInfo,
  ClassicRunner,
  Configuration,
  Eyes,
  StitchMode,
  Target,
} from '@applitools/eyes-playwright';
import type {
  CheckSettingsAutomation,
  Driver,
  Selector,
} from '@applitools/eyes-playwright';
import type {Locator, Page, TestInfo} from '@playwright/test';
import {execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

import {FONT_FAMILY_NAMES, loadFonts} from '@code-dot-org/fonts';

/**
 * Match timeout that the legacy Ruby Eyes steps overrode from the Applitools
 * default of 2s. Keep parity with `MATCH_TIMEOUT = 5` in eyes_steps.rb.
 */
const MATCH_TIMEOUT_MS = 5000;

/**
 * Legacy Chrome viewport used by Cucumber Eyes baselines. Keep the viewport
 * stable so Playwright snapshots remain comparable while their baselines are
 * isolated from the legacy `test` branch.
 */
const LEGACY_VIEWPORT = {width: 1024, height: 690};

const VISUAL_READY_TIMEOUT_MS = 30_000;
const IGNORE_BOX_PADDING_PX = 16;

const PLAYWRIGHT_VISUAL_BASELINE_DIR =
  process.env.APPS_E2E_VISUAL_BASELINE_DIR ?? '/tmp/apps-e2e-visual-baselines';
const PLAYWRIGHT_VISUAL_MODE =
  process.env.APPS_E2E_VISUAL_MODE === 'playwright';
const UPDATE_PLAYWRIGHT_VISUAL_BASELINE =
  process.env.APPS_E2E_UPDATE_VISUAL_BASELINE === '1';
const PLAYWRIGHT_VISUAL_DIFF_THRESHOLD = 0.1;

type EyesBackedPage = Page & {
  __eyes?: Eyes;
};

interface IgnoreBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EyesCheckOptions {
  /**
   * Playwright locators for generated or environment-specific regions that
   * should not decide the screenshot. Prefer a11y locators such as
   * `page.getByRole(...)`. Missing regions are ignored.
   */
  ignoreRegions?: Locator[];
}

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
   * it verbatim so migrated scenarios keep their existing names.
   * Optional; first `check` call will auto-open with the Playwright test
   * title if `open` was not called.
   */
  open(cucumberTestName: string): Promise<void>;
  /** Full-page visual checkpoint. Equivalent to Cucumber `I see no difference for "X"`. */
  check(name: string, options?: EyesCheckOptions): Promise<void>;
  /** Viewport-only visual checkpoint. Equivalent to `... in the current viewport`. */
  checkViewport(name: string, options?: EyesCheckOptions): Promise<void>;
  /**
   * Region visual checkpoint, scoped to the given CSS selector. Equivalent
   * to Cucumber `... within "<selector>"` — pass the same selector string
   * the legacy step used.
   */
  checkRegion(selector: string, name: string): Promise<void>;
  /**
   * Region visual checkpoint scoped to a resolved Playwright locator. Use
   * this when a stable visual subject is best identified by role/name or by a
   * locator relation, rather than by a unique CSS selector.
   */
  checkLocator(locator: Locator, name: string): Promise<void>;
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
  const parentBranchName = process.env.APPLITOOLS_PARENT_BRANCH;
  if (parentBranchName) {
    config.setParentBranchName(parentBranchName);
  }

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

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise.finally(() => {
      if (timeout) clearTimeout(timeout);
    }),
    new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
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
  checkLocator: async () => undefined,
};

/**
 * Test fixture extension to drive Eyes lifecycle from the per-test fixture
 * teardown. `close` runs at end-of-test and is fail-fast on diff.
 */
export interface EyesHandle extends EyesFixture {
  /**
   * Close hook retained for the shared fixture. Live Eyes sessions are closed
   * by the Applitools Playwright fixture so it can write HTML report data.
   */
  close(): Promise<void>;
}

/**
 * Construct an `EyesHandle` bound to the given Playwright `page` and the
 * Playwright test title. The Playwright title is only used as a fallback
 * test name when the test does not call `open(...)` first; migrated Eyes
 * tests SHOULD call `open` with the exact string the legacy
 * `I open my eyes to test "X"` step used.
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
  testInfo?: TestInfo,
): EyesHandle {
  let opened = false;
  let explicitTestName: string | undefined;
  const screenshotCounts = new Map<string, number>();

  /**
   * Open the Applitools session. Resizes the page viewport to the legacy
   * Cucumber Chrome viewport (1024x690) so Playwright baselines are stable
   * across runs.
   *
   * The Eyes SDK bundles its own copy of playwright-core, so its `Driver`
   * type is structurally identical but nominally distinct from the
   * `@playwright/test` Page type. Cast at the boundary; identical at
   * runtime.
   */
  async function openSession(testName: string): Promise<void> {
    if (PLAYWRIGHT_VISUAL_MODE) {
      await page.setViewportSize(LEGACY_VIEWPORT);
      opened = true;
      return;
    }
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

  /**
   * Wait for generic browser rendering readiness before a visual checkpoint.
   * Page-specific state such as lab chrome, progress bubbles, Blockly, and
   * teacher dashboards belongs in the POM that owns the page.
   */
  async function waitForVisualReadiness(): Promise<void> {
    await page.mouse.move(0, 0);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });

    await page.evaluate(() => {
      if (document.getElementById('apps-e2e-visual-stability-style')) return;
      const style = document.createElement('style');
      style.id = 'apps-e2e-visual-stability-style';
      style.textContent = `
        *, *::before, *::after {
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          scroll-behavior: auto !important;
          transition-delay: 0s !important;
          transition-duration: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });

    const fontsReady = await page.evaluate(
      () => !document.fonts || document.fonts.status === 'loaded',
    );
    if (!fontsReady) {
      await withTimeout(
        page.evaluate(loadFonts, FONT_FAMILY_NAMES),
        VISUAL_READY_TIMEOUT_MS,
        'Timed out waiting for fonts',
      );
    }

    await page.waitForFunction(
      () => !document.fonts || document.fonts.status === 'loaded',
      undefined,
      {timeout: VISUAL_READY_TIMEOUT_MS},
    );

    await page.waitForFunction(
      () =>
        [...document.images]
          .filter(image => {
            const rect = image.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          })
          // Broken legacy instruction images are still a settled browser
          // state.  Waiting on naturalWidth keeps otherwise-ready Java Lab
          // pages blocked forever.
          .every(image => image.complete),
      undefined,
      {timeout: VISUAL_READY_TIMEOUT_MS},
    );

    await page.waitForFunction(
      async () => {
        const selectors = ['html', 'body', 'header', 'main', 'footer'];
        const signature = () =>
          selectors
            .flatMap(selector =>
              [...document.querySelectorAll(selector)].map(element => ({
                element,
                selector,
              })),
            )
            .map(({element, selector}) => {
              const rect = element.getBoundingClientRect();
              const styles = getComputedStyle(element);
              return [
                selector,
                Math.round(rect.x),
                Math.round(rect.y),
                Math.round(rect.width),
                Math.round(rect.height),
                Math.round(element.scrollHeight),
                element.className,
                element.getAttribute('title'),
                element.getAttribute('href'),
                element.textContent?.trim(),
                styles.backgroundColor,
                styles.borderTopColor,
              ].join(':');
            })
            .join('|');

        let previous = signature();
        for (let i = 0; i < 5; i++) {
          await new Promise<void>(resolve =>
            requestAnimationFrame(() => resolve()),
          );
          const current = signature();
          if (current !== previous) return false;
          previous = current;
        }
        return true;
      },
      undefined,
      {timeout: VISUAL_READY_TIMEOUT_MS, polling: 250},
    );
  }

  async function visualIgnoreRegions(
    options?: EyesCheckOptions,
  ): Promise<Locator[]> {
    return [
      ...globalIgnoreLocators(),
      ...(await dynamicVisualizationLocators()),
      ...(options?.ignoreRegions ?? []),
    ];
  }

  /**
   * Global dynamic regions expressed as Playwright locators. Prefer semantic
   * locators where the page exposes useful a11y, and use CSS locators only for
   * legacy UI without stable accessible names.
   */
  function globalIgnoreLocators(): Locator[] {
    return [
      page.locator('#environment_tag'),
      page.locator('#sign_in_or_user'),
      page.locator('.header_button.header_user.user_menu'),
      page.locator('#project-name'),
      page.locator('#projectName'),
      page.locator('#project-title'),
      page.locator('.project-name'),
      page.locator('.project_name'),
      page.locator('.project-title'),
      page.locator('.project_updated_at'),
      page.locator('.xterm-cursor'),
      page.locator('#uitest-codebridge-console .xterm-rows .xterm-fg-8'),
      page.locator('#ui-feedback-submitted-timestamp'),
      page.locator('#lockout-last-email-date'),
      page.locator('.lockout-panel #lockout-panel-form > p:nth-of-type(2) b'),
      page.locator('#ui-test-section-code-button'),
      page.locator('#uitest-no-section-code'),
      page.locator('[class*="sectionCode"]'),
      page.locator('[class*="SectionCode"]'),
      page.locator('[class*="section-code"]'),
      page.locator('[class*="sectionCodeText"]'),
      page.locator('[class*="sectionCodeBox"]'),
      page.getByRole('button', {name: /^[A-Z]{6}$/}),
      page.getByRole('button', {name: /^[A-Z]{6}$/}).locator('xpath=..'),
      page.getByLabel(/email/i),
      page.locator('input[type="email"]'),
      page.locator('#email'),
      page.locator('#user_email'),
      page.locator('input[id*="email"]'),
      page.locator('input[name*="email"]'),
      page.locator('.match .answer'),
      page.locator('.teacher-panel .uitest-sectionselect'),
      page.locator('#teacher-panel-container .uitest-sectionselect'),
      page.locator('.student-table td [class*="name"]'),
      page.locator('#teacher-panel-container .student-table td:first-child'),
      page
        .getByRole('navigation', {name: 'AI differentiation chat threads'})
        .locator('li p'),
    ];
  }

  async function existingLocatorsForRegions(
    regions: Locator[],
  ): Promise<Locator[]> {
    const locators: Locator[] = [];
    for (const region of regions) {
      if ((await region.count()) > 0) {
        locators.push(region);
      }
    }

    return locators;
  }

  async function applyIgnoreRegions(
    target: CheckSettingsAutomation,
    options?: EyesCheckOptions,
  ): Promise<CheckSettingsAutomation> {
    let targetWithIgnores = target;
    for (const region of await visualIgnoreRegions(options)) {
      if ((await region.count()) > 0) {
        targetWithIgnores = targetWithIgnores.ignoreRegions(
          region as unknown as Selector,
        );
      }
    }
    return targetWithIgnores;
  }

  /**
   * Some legacy labs intentionally generate a different board, stage, or
   * answer ordering on reload. Their tests assert readiness and user behavior
   * separately; the visual checkpoint should cover the surrounding UI chrome.
   */
  async function dynamicVisualizationLocators(): Promise<Locator[]> {
    const locatorNames = await page
      .evaluate(() => {
        const locators: string[] = [];
        const win = window as unknown as Window & {
          Maze?: {
            controller?: {
              level?: {shapeShift?: boolean};
              map?: {hasMultiplePossibleGrids?: () => boolean};
            };
          };
        };
        const path = window.location.pathname;
        const maze = win.Maze;
        const isLegacyCsfLab =
          /\/lessons\/(?:1|2|4|5|6|24|25|37|41)\//.test(path) ||
          /\/courses\/mc\//.test(path) ||
          !!maze;
        const hasGeneratedMaze =
          !!(
            maze?.controller?.level?.shapeShift ||
            maze?.controller?.map?.hasMultiplePossibleGrids?.()
          ) || isLegacyCsfLab;

        if (hasGeneratedMaze) {
          locators.push('visualization', 'jigsaw', 'puzzle');
        }

        if (/\/lessons\/41\//.test(path)) {
          locators.push('contained-level', 'editor-column');
        }

        if (document.querySelector('#divDancePartyVisualization')) {
          locators.push('visualization', 'dance-visualization');
        }

        return locators;
      })
      .catch(() => []);

    const locators: Locator[] = [];
    for (const name of locatorNames) {
      switch (name) {
        case 'visualization':
          locators.push(
            page.locator('#visualization'),
            page.locator('#visualizationColumn'),
          );
          break;
        case 'jigsaw':
          locators.push(page.locator('#jigsaw'), page.locator('.jigsaw'));
          break;
        case 'puzzle':
          locators.push(
            page.locator('#puzzle'),
            page.locator('#puzzle-container'),
          );
          break;
        case 'contained-level':
          locators.push(page.locator('#containedLevel'));
          break;
        case 'editor-column':
          locators.push(page.locator('.editor-column'));
          break;
        case 'dance-visualization':
          locators.push(page.locator('#divDancePartyVisualization'));
          break;
      }
    }

    return locators;
  }

  function currentTestName(): string {
    return explicitTestName ?? fallbackTestName;
  }

  function screenshotBaselinePath(name: string, kind: string): string {
    const key = `${kind}:${currentTestName()}:${name}`;
    const count = (screenshotCounts.get(key) ?? 0) + 1;
    screenshotCounts.set(key, count);
    const rawName = `${currentTestName()}-${name}-${kind}-${count}`;
    const slug =
      rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100) || 'checkpoint';
    const hash = createHash('sha1').update(rawName).digest('hex').slice(0, 10);
    return path.join(PLAYWRIGHT_VISUAL_BASELINE_DIR, `${slug}-${hash}.png`);
  }

  async function compareOrUpdateScreenshot(
    name: string,
    kind: string,
    actualBuffer: Buffer,
    ignoreBoxes: IgnoreBox[] = [],
  ): Promise<void> {
    const baselinePath = screenshotBaselinePath(name, kind);
    if (UPDATE_PLAYWRIGHT_VISUAL_BASELINE) {
      fs.mkdirSync(path.dirname(baselinePath), {recursive: true});
      fs.writeFileSync(baselinePath, actualBuffer);
      return;
    }

    if (!fs.existsSync(baselinePath)) {
      throw new Error(
        `Missing Playwright visual baseline: ${baselinePath}. ` +
          'Run once with APPS_E2E_UPDATE_VISUAL_BASELINE=1.',
      );
    }

    const expected = PNG.sync.read(fs.readFileSync(baselinePath));
    const actual = PNG.sync.read(actualBuffer);
    const basename = path.basename(baselinePath, '.png');
    const actualPath =
      testInfo?.outputPath(`${basename}-actual.png`) ??
      path.join(PLAYWRIGHT_VISUAL_BASELINE_DIR, `${basename}-actual.png`);

    if (expected.width !== actual.width || expected.height !== actual.height) {
      fs.writeFileSync(actualPath, actualBuffer);
      await testInfo?.attach('playwright-visual-actual', {
        path: actualPath,
        contentType: 'image/png',
      });
      throw new Error(
        `Playwright visual screenshot size changed for "${name}": ` +
          `expected ${expected.width}x${expected.height}, ` +
          `actual ${actual.width}x${actual.height}.`,
      );
    }

    applyIgnoreBoxes(expected, ignoreBoxes);
    applyIgnoreBoxes(actual, ignoreBoxes);

    const diff = new PNG({width: expected.width, height: expected.height});
    const diffPixels = pixelmatch(
      expected.data,
      actual.data,
      diff.data,
      expected.width,
      expected.height,
      {threshold: PLAYWRIGHT_VISUAL_DIFF_THRESHOLD},
    );
    if (diffPixels === 0) return;

    const diffPath =
      testInfo?.outputPath(`${basename}-diff.png`) ??
      path.join(PLAYWRIGHT_VISUAL_BASELINE_DIR, `${basename}-diff.png`);
    fs.writeFileSync(actualPath, actualBuffer);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    await testInfo?.attach('playwright-visual-actual', {
      path: actualPath,
      contentType: 'image/png',
    });
    await testInfo?.attach('playwright-visual-diff', {
      path: diffPath,
      contentType: 'image/png',
    });
    throw new Error(
      `Playwright visual screenshot changed for "${name}": ${diffPixels} pixels differ.`,
    );
  }

  /**
   * Resolve ignore locators to screenshot-space boxes for local comparison.
   * Full-page screenshots use document coordinates; viewport screenshots use
   * viewport coordinates.
   */
  async function screenshotIgnoreBoxes(
    options: EyesCheckOptions | undefined,
    fullPage: boolean,
  ): Promise<IgnoreBox[]> {
    const regions = await existingLocatorsForRegions(
      await visualIgnoreRegions(options),
    );
    const scrollOffset = fullPage
      ? await page.evaluate(() => ({
          x: window.scrollX,
          y: window.scrollY,
        }))
      : {x: 0, y: 0};
    const boxes: IgnoreBox[] = [];

    for (const region of regions) {
      for (const locator of await region.all()) {
        const box = await locator.boundingBox().catch(() => null);
        if (!box || box.width <= 0 || box.height <= 0) continue;
        boxes.push({
          x: box.x + scrollOffset.x,
          y: box.y + scrollOffset.y,
          width: box.width,
          height: box.height,
        });
      }
    }

    return boxes;
  }

  /**
   * Paint ignored boxes into an in-memory PNG before diffing. This mirrors
   * Eyes ignore semantics better than Playwright screenshot masks because the
   * same box is applied to baseline and actual for the comparison.
   */
  function applyIgnoreBoxes(image: PNG, boxes: IgnoreBox[]): void {
    for (const box of boxes) {
      const left = Math.max(0, Math.floor(box.x - IGNORE_BOX_PADDING_PX));
      const top = Math.max(0, Math.floor(box.y - IGNORE_BOX_PADDING_PX));
      const right = Math.min(
        image.width,
        Math.ceil(box.x + box.width + IGNORE_BOX_PADDING_PX),
      );
      const bottom = Math.min(
        image.height,
        Math.ceil(box.y + box.height + IGNORE_BOX_PADDING_PX),
      );

      for (let y = top; y < bottom; y++) {
        for (let x = left; x < right; x++) {
          const index = (image.width * y + x) << 2;
          image.data[index] = 255;
          image.data[index + 1] = 0;
          image.data[index + 2] = 255;
          image.data[index + 3] = 255;
        }
      }
    }
  }

  if (PLAYWRIGHT_VISUAL_MODE) {
    return {
      async open(cucumberTestName) {
        explicitTestName = cucumberTestName;
        await openSession(cucumberTestName);
      },
      async check(name, options) {
        await ensureOpen();
        await waitForVisualReadiness();
        const ignoreBoxes = await screenshotIgnoreBoxes(options, true);
        await compareOrUpdateScreenshot(
          name,
          'full-page',
          await page.screenshot({
            animations: 'disabled',
            caret: 'hide',
            fullPage: true,
          }),
          ignoreBoxes,
        );
      },
      async checkViewport(name, options) {
        await ensureOpen();
        await waitForVisualReadiness();
        const ignoreBoxes = await screenshotIgnoreBoxes(options, false);
        await compareOrUpdateScreenshot(
          name,
          'viewport',
          await page.screenshot({
            animations: 'disabled',
            caret: 'hide',
            fullPage: false,
          }),
          ignoreBoxes,
        );
      },
      async checkRegion(selector, name) {
        await ensureOpen();
        await waitForVisualReadiness();
        await compareOrUpdateScreenshot(
          name,
          `region-${selector}`,
          await page.locator(selector).screenshot({
            animations: 'disabled',
            caret: 'hide',
          }),
        );
      },
      async checkLocator(locator, name) {
        await ensureOpen();
        await waitForVisualReadiness();
        await compareOrUpdateScreenshot(
          name,
          'region-locator',
          await locator.screenshot({
            animations: 'disabled',
            caret: 'hide',
          }),
        );
      },
      async close() {
        return undefined;
      },
    };
  }

  const apiKey = process.env.APPLITOOLS_API_KEY;
  if (!apiKey) {
    return {...NOOP_EYES, close: async () => undefined};
  }

  const runner = new ClassicRunner();
  const eyes = new Eyes(runner, buildConfiguration(apiKey));
  (page as EyesBackedPage).__eyes = eyes;

  return {
    async open(cucumberTestName) {
      explicitTestName = cucumberTestName;
      await openSession(cucumberTestName);
    },
    async check(name, options) {
      await ensureOpen();
      await waitForVisualReadiness();
      await eyes.check(
        name,
        await applyIgnoreRegions(Target.window().fully(), options),
      );
    },
    async checkViewport(name, options) {
      await ensureOpen();
      await waitForVisualReadiness();
      await eyes.check(
        name,
        await applyIgnoreRegions(Target.window(), options),
      );
    },
    async checkRegion(selector, name) {
      await ensureOpen();
      await waitForVisualReadiness();
      await eyes.check(name, Target.region(selector).fully());
    },
    async checkLocator(locator, name) {
      await ensureOpen();
      await waitForVisualReadiness();
      await eyes.check(
        name,
        Target.region(locator as unknown as Selector).fully(),
      );
    },
    async close() {
      return undefined;
    },
  };
}
