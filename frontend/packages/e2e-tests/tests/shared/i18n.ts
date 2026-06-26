import {expect, type Locator, type Page} from '@playwright/test';

interface BackendI18nOptions {
  page: Page;
  locale: string;
  key: string;
}

/** Normalize i18n text for comparison: nbsp (U+00A0) -> space, then trim. */
const normalize = (text: string): string => text.replace(/\u00a0/g, ' ').trim();

/**
 * Fetch the localized string for `key`/`locale` from the backend test API
 * (/api/test/get_i18n_t), normalized as browser_helpers.rb element_has_i18n_text
 * normalizes it.
 */
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
}

/**
 * Assert an element's text matches the backend i18n string for `key`/`locale`,
 * the Playwright port of browser_helpers.rb element_has_i18n_text: both sides
 * are normalized (nbsp, trim) before an exact comparison.
 */
export async function expectElementHasI18nText({
  locator,
  locale,
  key,
}: ElementI18nOptions): Promise<void> {
  await expect(locator).toBeVisible();
  const expected = await getBackendI18nText({
    page: locator.page(),
    locale,
    key,
  });
  const actual = normalize((await locator.textContent()) ?? '');
  expect(actual).toBe(expected);
}
