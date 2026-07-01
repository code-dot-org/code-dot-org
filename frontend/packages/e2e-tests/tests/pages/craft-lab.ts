import {type Page} from '@playwright/test';

const CRAFT_DEV_URL = process.env.CRAFT_DEV_URL ?? 'http://localhost:5173';

/** Navigate to the craft integration test harness and wait for readiness. */
export async function gotoCraftHarness(page: Page): Promise<void> {
  await page.goto(`${CRAFT_DEV_URL}/test/integration-harness.html`, {
    waitUntil: 'domcontentloaded',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.waitForFunction(() => (window as any).__craftTest?.ready, {
    timeout: 30_000,
  });
}

/** Check whether the craft Vite dev server is reachable. */
export async function isCraftDevServerUp(): Promise<boolean> {
  try {
    const res = await fetch(`${CRAFT_DEV_URL}/test/integration-harness.html`, {
      signal: AbortSignal.timeout(3_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
