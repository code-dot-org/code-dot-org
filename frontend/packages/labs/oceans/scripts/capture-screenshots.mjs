// Capture pixel-comparison screenshots for the AI for Oceans lab across
// chromium, firefox, and webkit at mobile/tablet/desktop viewports in
// portrait + landscape orientations.  Drives both the standalone dev
// server (5173) and the studio embed (3036/frontend-studio).  Output is
// PNGs under the directory passed via OUT_DIR (defaults to
// /tmp/oceans-baseline).  See plan: mutable-jumping-perlis.md, step 1
// (and the symmetric step 7).
//
// Invocation:
//   OUT_DIR=/tmp/oceans-baseline node scripts/capture-screenshots.mjs
//   OUT_DIR=/tmp/oceans-checkpoint node scripts/capture-screenshots.mjs

import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {chromium, firefox, webkit} from 'playwright';

const OUT_DIR = process.env.OUT_DIR ?? '/tmp/oceans-baseline';
const STANDALONE_BASE = process.env.STANDALONE_URL ?? 'http://localhost:5173';
// Studio is accessed via the Rails proxy (port 3000) per the studio
// architecture doc — direct Vite (3036) routes 404 because Vite serves
// under `/frontend-studio/` while TanStack's router has basepath `/app`.
const STUDIO_BASE =
  process.env.STUDIO_URL ?? 'http://localhost-studio.code.org:3000/app';
// The studio route is /projects/<labKey>/<channelId>/edit; the dev
// server doesn't validate channelId so any short token works.
const STUDIO_CHANNEL = process.env.STUDIO_CHANNEL ?? 'abcXYZ123';

const VIEWPORTS = [
  {label: 'mobile-portrait', width: 375, height: 667},
  {label: 'mobile-landscape', width: 667, height: 375},
  {label: 'tablet-portrait', width: 768, height: 1024},
  {label: 'tablet-landscape', width: 1024, height: 768},
  {label: 'desktop', width: 1280, height: 800},
];

const ENGINES = {chromium, firefox, webkit};

// Scenes to capture per mode.  Each scene is a (page, mode) -> Promise<void>
// that leaves the page in the desired visual state, then the runner snapshots.
const STANDALONE_MODES = [
  {
    mode: 'fishvtrash',
    scenes: [
      {name: 'train', setup: async () => {}},
      {
        name: 'predict',
        setup: async page => {
          await page
            .getByRole('button', {name: 'Continue'})
            .click({timeout: 10_000});
          await page
            .locator('#uitest-run-btn')
            .waitFor({state: 'visible', timeout: 20_000});
        },
      },
    ],
  },
  {
    mode: 'short',
    scenes: [{name: 'words', setup: async () => {}}],
  },
  {
    mode: 'creaturesvtrashdemo',
    scenes: [
      {
        name: 'predict',
        setup: async page => {
          await page
            .locator('#uitest-run-btn')
            .waitFor({state: 'visible', timeout: 20_000});
        },
      },
    ],
  },
];

// Studio exercises the lab inside its flex-column shell.  Mode is fixed
// by the level config server-side; the only scene we can reach without
// driving training first is `train`.  That is enough to confirm the
// shell wraps the lab correctly.
const STUDIO_MODES = [
  {mode: 'fishvtrash', scenes: [{name: 'train', setup: async () => {}}]},
];

const TRANSITIONS = [
  {
    label: 'resize-desktop-to-mobile',
    from: {width: 1280, height: 800},
    to: {width: 375, height: 667},
  },
  {
    label: 'resize-mobile-to-desktop',
    from: {width: 375, height: 667},
    to: {width: 1280, height: 800},
  },
  {
    label: 'rotate-portrait-to-landscape',
    from: {width: 375, height: 667},
    to: {width: 667, height: 375},
  },
  {
    label: 'rotate-landscape-to-portrait',
    from: {width: 667, height: 375},
    to: {width: 375, height: 667},
  },
];

mkdirSync(OUT_DIR, {recursive: true});

/**
 * Build the URL that loads the lab in a given host with the right query.
 */
function urlFor(host, mode) {
  if (host === 'standalone') {
    return `${STANDALONE_BASE}/?mode=${mode}&guide=off&guides=off`;
  }
  // Studio: route is /projects/oceans/<channelId>/edit.  Mode is set
  // server-side by the level config; for screenshot purposes we just want
  // "the lab rendered inside the studio shell."  `guide=off` reaches the
  // lab via `queryStrFor` reading window.location.search (the studio
  // entry passes through preserves the query string).
  void mode;
  return `${STUDIO_BASE}/projects/oceans/${STUDIO_CHANNEL}/edit?guide=off&guides=off`;
}

/**
 * Wait for the lab to settle into a visible scene before screenshotting.
 * The Erase button is the sentinel for fishvtrash/creaturesvtrash train;
 * the .words-button class is the sentinel for the words scene; the run
 * button (#uitest-run-btn) is the sentinel for predict.
 */
/**
 * Click through any active guide overlays so the underlying scene sentinel
 * becomes interactable.  The studio embed doesn't pass `?guide=off` and the
 * default guide tour covers the Erase button until dismissed.  We keep
 * clicking the dismiss target until it disappears (or 8 tries / 8 s).
 */
async function dismissGuides(page) {
  for (let i = 0; i < 8; i++) {
    const dismiss = page.locator('#uitest-dismiss-guide');
    if (!(await dismiss.isVisible().catch(() => false))) {
      return;
    }
    await dismiss.click({force: true, timeout: 1000}).catch(() => {});
    await page.waitForTimeout(400);
  }
}

async function waitForLabReady(page, mode, {host} = {}) {
  await dismissGuides(page);
  if (mode === 'short' || mode === 'long') {
    await page
      .locator('.words-button')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  } else if (mode === 'creaturesvtrashdemo') {
    await page
      .locator('#uitest-run-btn')
      .waitFor({state: 'visible', timeout: 30_000});
  } else if (host === 'studio') {
    // Studio's render is missing the Erase button (pre-existing issue,
    // separate from Radium).  Fall back to the "Not Fish" Yes/No button
    // which IS present and is unambiguous proof of training scene.
    await page
      .getByRole('button', {name: /Not Fish/i})
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  } else {
    await page
      .getByRole('button', {name: 'Erase'})
      .waitFor({state: 'visible', timeout: 30_000});
  }
}

async function captureFor(engineName, browser, host, modeDefs) {
  for (const {mode, scenes} of modeDefs) {
    for (const viewport of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: {width: viewport.width, height: viewport.height},
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      try {
        await page.goto(urlFor(host, mode), {
          waitUntil: 'domcontentloaded',
          timeout: 60_000,
        });
        await waitForLabReady(page, mode, {host});
        for (const scene of scenes) {
          await scene.setup(page);
          // Small settle delay lets transition: transform 500ms finish.
          await page.waitForTimeout(700);
          const fname = `${host}_${engineName}_${viewport.label}_${mode}_${scene.name}.png`;
          await page.screenshot({
            path: join(OUT_DIR, fname),
            fullPage: false,
            animations: 'disabled',
          });
          console.log('captured', fname);
        }
      } catch (err) {
        console.error(
          `FAIL ${host}/${engineName}/${viewport.label}/${mode}:`,
          err.message,
        );
      } finally {
        await ctx.close();
      }
    }
  }
}

async function captureTransitions(engineName, browser, host) {
  const mode = 'fishvtrash';
  for (const t of TRANSITIONS) {
    const ctx = await browser.newContext({
      viewport: {width: t.from.width, height: t.from.height},
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(urlFor(host, mode), {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });
      await waitForLabReady(page, mode, {host});
      await page.waitForTimeout(500);
      await page.screenshot({
        path: join(
          OUT_DIR,
          `${host}_${engineName}_transition-${t.label}_before.png`,
        ),
        animations: 'disabled',
      });
      await page.setViewportSize({width: t.to.width, height: t.to.height});
      await page.waitForTimeout(700);
      await page.screenshot({
        path: join(
          OUT_DIR,
          `${host}_${engineName}_transition-${t.label}_after.png`,
        ),
        animations: 'disabled',
      });
      console.log('captured transition', t.label, host, engineName);
    } catch (err) {
      console.error(
        `FAIL transition ${host}/${engineName}/${t.label}:`,
        err.message,
      );
    } finally {
      await ctx.close();
    }
  }
}

// Studio runs through the Rails dashboard's session/asset machinery and the
// resulting page silently closes in Playwright-controlled chromium and
// webkit (no JS error, no `window.close()` interception, just `close`
// event ~500 ms after `load`).  Firefox is fine.  Until that's diagnosed,
// studio captures use Firefox only — the lab's visual interior is
// already exercised by the three-engine standalone matrix.
const STUDIO_ENGINES = new Set(['firefox']);

for (const [engineName, engine] of Object.entries(ENGINES)) {
  const browser = await engine.launch();
  try {
    await captureFor(engineName, browser, 'standalone', STANDALONE_MODES);
    if (STUDIO_ENGINES.has(engineName)) {
      await captureFor(engineName, browser, 'studio', STUDIO_MODES);
      await captureTransitions(engineName, browser, 'studio');
    }
    await captureTransitions(engineName, browser, 'standalone');
  } finally {
    await browser.close();
  }
}

console.log('done. outputs in', OUT_DIR);
