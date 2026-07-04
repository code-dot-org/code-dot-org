import {expect, type Page} from '@playwright/test';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

/** viewport per visual-artifacts.md — deviceScaleFactor 1 assumed by the config's chromium project. */
const DEFAULT_VIEWPORT = {width: 1280, height: 720};

/** Kills animations/transitions/caret blink so two loads of the same page paint identically. */
const STABILIZE_CSS = `*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}`;

export interface CaptureRegionOptions {
  /** Path (or absolute URL) to navigate to before capturing. */
  url: string;
  /** Region to screenshot — never full-page (visual-artifacts.md). */
  selector: string;
  /**
   * Selectors to cover with an opaque overlay before capture. Callers should
   * bind each selector to a named constant at the call site (visual-artifacts.md
   * "NAMED locators") — this helper takes bare selectors. Each selector may
   * match more than one element (e.g. one per roster row); every match is
   * masked.
   */
  masks?: string[];
  viewport?: {width: number; height: number};
  /** Extra CSS injected after stabilization; used to simulate a perturbation in tests. */
  injectCss?: string;
  /**
   * Cookies to set before the page's first script runs (visual-artifacts.md
   * stabilization #4, e.g. `hide_codeai_logo_transition`). Applied via a
   * throwaway navigation + reload, since setting a cookie requires an origin
   * document to scope it to.
   */
  cookies?: Array<{name: string; value: string}>;
  /**
   * Freezes `Date`/`Date.now()` before the page loads, for routes that render
   * relative or absolute dates (visual-artifacts.md stabilization #5).
   */
  fixedTime?: number | string | Date;
  /**
   * Selector to wait for (visible) after navigation, before stabilization CSS
   * and masks are applied — the per-route "ready sentinel" visual-artifacts.md
   * stabilization #7 requires, distinct from the region selector itself
   * (which mounts before client-side data finishes rendering).
   */
  readySelector?: string;
  /**
   * Best-effort wait for a matching network response during the final
   * navigation (visual-artifacts.md stabilization #7's "section payload"
   * wait). Non-fatal if nothing matches within 5s — some routes hydrate
   * entirely from server-embedded data with no follow-up request.
   */
  waitForResponseUrl?: string | RegExp;
}

/**
 * Covers every element matching each mask selector with a solid overlay over
 * its current bounding box. Overlays are position:absolute in DOCUMENT
 * coordinates, not fixed: locator.screenshot() scrolls to stitch regions
 * taller than the viewport, and a fixed overlay would land at a
 * scroll-dependent (nondeterministic) document position in the stitched
 * capture. Boxes are exact-size, deliberately uninflated: with fonts settled
 * before measurement (see captureRegion), layout is identical across
 * captures, and any pixel escaping a mask is a real signal, not noise.
 */
async function applyMasks(page: Page, masks: string[]): Promise<void> {
  for (const selector of masks) {
    const rects = await page.locator(selector).evaluateAll(elements =>
      elements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.x + window.scrollX,
          y: rect.y + window.scrollY,
          width: rect.width,
          height: rect.height,
        };
      }),
    );
    for (const box of rects) {
      if (box.width === 0 && box.height === 0) continue;
      await page.evaluate(({x, y, width, height}) => {
        const overlay = document.createElement('div');
        overlay.setAttribute('data-visual-parity-mask', 'true');
        Object.assign(overlay.style, {
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          background: '#888',
          zIndex: '2147483647',
          pointerEvents: 'none',
        });
        document.body.appendChild(overlay);
      }, box);
    }
  }
}

/**
 * Navigates to `url`, tolerating one retry if the response is a 500 (the
 * documented intermittent session_store quirk — apply-log.md "Environment
 * observation"). Optionally races a `waitForResponse` alongside the
 * navigation that started it.
 */
async function gotoTolerating500(
  page: Page,
  url: string,
  waitForResponseUrl?: string | RegExp,
): Promise<void> {
  const attempt = async () => {
    const responsePromise = waitForResponseUrl
      ? page
          .waitForResponse(waitForResponseUrl, {timeout: 5_000})
          .catch(() => undefined)
      : undefined;
    const response = await page.goto(url, {waitUntil: 'domcontentloaded'});
    await responsePromise;
    return response;
  };

  const first = await attempt();
  if (first?.status() !== 500) return;

  const retry = await attempt();
  if (retry?.status() === 500) {
    throw new Error(
      `Persistent 500 loading ${url} after one retry (see apply-log.md "Environment observation")`,
    );
  }
}

/**
 * Navigate to `url`, stabilize the page (fonts, animations, reduced motion),
 * apply masks, and screenshot `selector` — region-scoped, never full-page.
 */
export async function captureRegion(
  page: Page,
  {
    url,
    selector,
    masks = [],
    viewport = DEFAULT_VIEWPORT,
    injectCss,
    cookies,
    fixedTime,
    readySelector,
    waitForResponseUrl,
  }: CaptureRegionOptions,
): Promise<Buffer> {
  await page.setViewportSize(viewport);
  await page.emulateMedia({reducedMotion: 'reduce'});

  if (cookies || fixedTime !== undefined) {
    // Establish an origin document first so cookies/clock can be set, then
    // reload — the second load is the one that must see them from its first
    // paint (LogoTransition reads the cookie at mount; Date is read at render).
    await gotoTolerating500(page, url);
    if (fixedTime !== undefined) {
      await page.clock.setFixedTime(fixedTime);
    }
    if (cookies) {
      await page
        .context()
        .addCookies(cookies.map(cookie => ({...cookie, url: page.url()})));
    }
  }

  await gotoTolerating500(page, url, waitForResponseUrl);
  await page.addStyleTag({content: STABILIZE_CSS});
  if (injectCss) {
    await page.addStyleTag({content: injectCss});
  }
  if (readySelector) {
    // .first(): a sentinel may match one element per row (e.g. login cards).
    await expect(page.locator(readySelector).first()).toBeVisible();
  }
  // Font wait AFTER the content sentinel, as a settled-state poll rather
  // than one fonts.ready await: fonts.ready resolves as soon as the fonts
  // known AT THAT MOMENT finish, which on a client-rendered page is before
  // the data-driven render requests its own font variants. A late-landing
  // webfont changes text metrics and shifts layout sub-pixel (proven on the
  // roster table: button x 1055.05 -> 1055.66 when fonts.status flipped to
  // 'loaded'), which is exactly the nondeterminism a pixel gate cannot have.
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  await applyMasks(page, masks);

  const locator = page.locator(selector);
  await expect(locator).toBeVisible();
  return locator.screenshot();
}

export interface CompareOptions {
  /** pixelmatch per-pixel threshold (sub-pixel AA noise only, not a diff-count tolerance). */
  threshold?: number;
}

export interface CompareResult {
  diffPixels: number;
  diffPng: Buffer;
}

/** Pixel-diffs two same-size region captures. Assertion convention: `diffPixels === 0`. */
export function compareRegions(
  a: Buffer,
  b: Buffer,
  {threshold = 0.1}: CompareOptions = {},
): CompareResult {
  const imgA = PNG.sync.read(a);
  const imgB = PNG.sync.read(b);
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    throw new Error(
      `Region size mismatch: ${imgA.width}x${imgA.height} vs ${imgB.width}x${imgB.height}`,
    );
  }

  const {width, height} = imgA;
  const diff = new PNG({width, height});
  const diffPixels = pixelmatch(
    imgA.data,
    imgB.data,
    diff.data,
    width,
    height,
    {threshold, includeAA: false},
  );
  return {diffPixels, diffPng: PNG.sync.write(diff)};
}

export interface ParityTestOptions {
  legacyUrl: string;
  candidateUrl: string;
  selector: string;
  masks?: string[];
  viewport?: {width: number; height: number};
  threshold?: number;
}

/**
 * Captures legacy and candidate in the same test (same page, same browser
 * context) and diffs them. Feature zero has no candidate routes yet — proven
 * here for reuse once feature 1 ships one (design.md §4).
 */
export async function parityTest(
  page: Page,
  {
    legacyUrl,
    candidateUrl,
    selector,
    masks,
    viewport,
    threshold,
  }: ParityTestOptions,
): Promise<CompareResult> {
  const legacy = await captureRegion(page, {
    url: legacyUrl,
    selector,
    masks,
    viewport,
  });
  const candidate = await captureRegion(page, {
    url: candidateUrl,
    selector,
    masks,
    viewport,
  });
  return compareRegions(legacy, candidate, {threshold});
}
