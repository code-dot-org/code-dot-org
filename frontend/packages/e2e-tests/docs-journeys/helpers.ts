import {type Locator, type Page} from '@playwright/test';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

/**
 * Take a documentation screenshot at 1280x800, light theme, with the
 * dev-environment ribbon hidden. Writes the PNG into the page's images/
 * directory under the audience root. Viewport only unless fullPage is set;
 * pass a locator to crop to one control (for "the button looks like this").
 */
export async function docsScreenshot(
  page: Page,
  relativeDocsPath: string,
  name: string,
  options: {fullPage?: boolean; locator?: Locator} = {},
): Promise<string> {
  await page.setViewportSize({width: 1280, height: 800});
  await page.emulateMedia({colorScheme: 'light'});

  // Hide the development-environment banner and rebrand overlay if present.
  await page.evaluate(() => {
    for (const sel of [
      '#environment_tag',
      '#admin-announcement',
      '#rebrand-announcement-banner',
    ]) {
      const el = document.querySelector(sel);
      if (el instanceof HTMLElement) el.style.display = 'none';
    }
    for (const el of document.querySelectorAll('[class*="alert"]')) {
      if (
        el.textContent?.includes('development') &&
        el instanceof HTMLElement
      ) {
        el.style.display = 'none';
      }
    }
    // Dismiss the rebrand banner for future page loads in this session.
    try {
      localStorage.setItem('2026-codeai-rebrand-banner', 'false');
    } catch {
      /* localStorage may be unavailable (e.g. blocked in this context). */
    }
    // Suppress the CodeAI logo transition animation (cookie-gated).
    document.cookie = 'hide_codeai_logo_transition=true; path=/; max-age=86400';
    // Dismiss any census/NPS/personalization prompt (the "Help us get to know you" banner).
    for (const el of document.querySelectorAll(
      '[class*="censusBanner"], [class*="Census"], [class*="nps"]',
    )) {
      if (el instanceof HTMLElement) el.style.display = 'none';
    }
    // Also hide the close-able info banner ("Want a more personalized...").
    const infoBanner = document.querySelector('[class*="infoBanner"]');
    if (infoBanner instanceof HTMLElement) infoBanner.style.display = 'none';
  });

  // Wait for web fonts.
  await page.evaluate(() => document.fonts.ready);

  const slug = path.basename(relativeDocsPath, path.extname(relativeDocsPath));
  const dir = path.dirname(relativeDocsPath);
  const outDir = path.join(REPO_ROOT, 'docs', dir, 'images');
  const filename = `${slug}-${name}.png`;
  const outPath = path.join(outDir, filename);

  if (options.locator) {
    await options.locator.screenshot({path: outPath});
  } else {
    await page.screenshot({path: outPath, fullPage: options.fullPage ?? false});
  }
  return outPath;
}
