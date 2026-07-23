import {
  BatchInfo,
  ClassicRunner,
  Configuration,
  Eyes,
  Target,
} from '@applitools/eyes-playwright';
import type {Page, TestInfo} from 'playwright/test';

import {settle} from './stability';
import type {VisualCheck} from './types';

/**
 * Shared Eyes config. `appName` is supplied per consumer via
 * {@link withApplitoolsCheck}; everything else is a frontend-wide default or
 * sourced from the CI environment. `parentBranchName='default'` uses
 * Applitools' trunk concept (not a git ref).
 */
const EYES_CONFIG = {
  parentBranchName: 'default',
  branchName: process.env.APPLITOOLS_BRANCH || undefined,
  batchId: process.env.APPLITOOLS_BATCH_ID || undefined,
  batchName: process.env.APPLITOOLS_BATCH_NAME || 'Frontend Eyes Tests',
  dontCloseBatches: true,
  notifyOnCompletion: true,
};

/** One-per-worker warning when running locally without an API key. */
let warnedAboutMissingKey = false;

/**
 * Applitools Eyes backend for the visualCheck fixture. No-ops with a warning
 * locally if APPLITOOLS_API_KEY is unset; throws in CI under the same
 * condition.
 *
 * @param page - Playwright Page fixture.
 * @param testInfo - Current test metadata (title, status).
 * @param use - Fixture use callback.
 * @param appName - Applitools application name for this consumer.
 */
export async function withApplitoolsCheck(
  page: Page,
  testInfo: TestInfo,
  use: (check: VisualCheck) => Promise<void>,
  appName: string,
): Promise<void> {
  const apiKey = process.env.APPLITOOLS_API_KEY;

  if (!apiKey) {
    if (process.env.CI === 'true') {
      throw new Error(
        '[visual] APPLITOOLS_API_KEY is required in CI but was not set.',
      );
    }
    if (!warnedAboutMissingKey) {
      console.warn('[visual] APPLITOOLS_API_KEY unset — Eyes checks no-op.');
      warnedAboutMissingKey = true;
    }
    const noopCheck: VisualCheck = async () => {};
    await use(noopCheck);
    return;
  }

  const {
    parentBranchName,
    branchName,
    batchId,
    batchName,
    dontCloseBatches,
    notifyOnCompletion,
  } = EYES_CONFIG;

  const runner = new ClassicRunner();
  const eyes = new Eyes(runner);

  const configuration = new Configuration();
  configuration.setApiKey(apiKey);
  configuration.setAppName(appName);
  configuration.setParentBranchName(parentBranchName);
  if (branchName) {
    configuration.setBranchName(branchName);
  }
  configuration.setDontCloseBatches(dontCloseBatches);

  const batch = new BatchInfo({
    id: batchId,
    name: batchName,
    notifyOnCompletion,
  });
  configuration.setBatch(batch);

  eyes.setConfiguration(configuration);

  await eyes.open(page, appName, testInfo.title);

  const check: VisualCheck = async (name, opts = {}) => {
    await settle(page);
    const fully = opts.fully ?? true;
    const target = opts.region
      ? Target.region(opts.region)
      : Target.window().fully(fully);
    if (opts.mask && opts.mask.length > 0) {
      target.ignoreRegions(...opts.mask);
    }
    await eyes.check(name, target);
  };

  try {
    await use(check);
    // close(true) throws on diff so a mismatch fails the test loudly.
    if (testInfo.status === 'passed') {
      await eyes.close(true);
    } else {
      await eyes.abort();
    }
  } catch (err) {
    await eyes.abort();
    throw err;
  }
}
