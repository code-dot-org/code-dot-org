import {expect, type Locator, type Page} from '@playwright/test';

interface BackendI18nOptions {
  page: Page;
  locale: string;
  key: string;
}

/** Normalize i18n text for comparison: nbsp (U+00A0) -> space, then trim. */
const normalize = (text: string): string => text.replace(/\u00a0/g, ' ').trim();

/** Fetch the localized string for `key`/`locale` from the backend test API. */
async function getBackendI18nText({
  page,
  locale,
  key,
}: BackendI18nOptions): Promise<string> {
  const text = await page.evaluate(
    async ({locale, key}) => {
      const params = new URLSearchParams({key, locale});
      const resp = await fetch(`/api/test/get_i18n_t?${params.toString()}`);
      if (!resp.ok) {
        throw new Error(`get_i18n_t failed: ${resp.status}`);
      }
      return resp.text();
    },
    {locale, key},
  );
  return normalize(text);
}

interface ElementI18nOptions {
  locator: Locator;
  locale: string;
  key: string;
  /** RTL text carries a directional mark (U+200F) the backend string lacks, so compare by substring. */
  rtl?: boolean;
}

/**
 * Assert an element's text is the backend i18n string for `key`/`locale`,
 * normalized (nbsp, trim) on both sides.
 *
 * Polls, because the text can be swapped in place after the element is already
 * visible (the instructions More/Less toggle does this). The fetch stays
 * outside the poll so the timeout budget goes to the transition rather than to
 * a backend round trip per attempt.
 */
export async function expectElementHasI18nText({
  locator,
  locale,
  key,
  rtl = false,
}: ElementI18nOptions): Promise<void> {
  await expect(locator).toBeVisible();
  const expected = await getBackendI18nText({
    page: locator.page(),
    locale,
    key,
  });
  const actual = expect.poll(async () =>
    normalize((await locator.textContent()) ?? ''),
  );
  if (rtl) {
    await actual.toContain(expected);
  } else {
    await actual.toBe(expected);
  }
}

interface ElementI18nMarkdownOptions {
  locator: Locator;
  locale: string;
  key: string;
}

const stripWhitespace = (text: string): string => text.replace(/\s/g, '');

/**
 * Reduce the markdown subset level instructions use to plain text. Not a
 * CommonMark parser, and doesn't need to be: both sides end up
 * whitespace-stripped, so only the visible characters have to match.
 */
function markdownToText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(\*|_)(.+?)\1/g, '$2')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1');
}

/**
 * Assert an element's rendered markdown is the backend i18n string for
 * `key`/`locale`, compared with all whitespace stripped from both sides.
 */
export async function expectElementHasI18nMarkdown({
  locator,
  locale,
  key,
}: ElementI18nMarkdownOptions): Promise<void> {
  await expect(locator).toBeVisible();
  const rawMarkdown = await getBackendI18nText({
    page: locator.page(),
    locale,
    key,
  });
  const expected = stripWhitespace(markdownToText(rawMarkdown));
  const actual = stripWhitespace((await locator.textContent()) ?? '');
  expect(actual).toBe(expected);
}
