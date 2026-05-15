import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for Global Edition Farsi MVP page assertions.
 */
export class GlobalEditionFaPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens a path with the Global Edition Farsi region selected.
   *
   * @param path - dashboard path
   */
  async gotoFa(path: string): Promise<void> {
    const [pathname, query = ''] = path.split('?');
    const params = new URLSearchParams(query);
    params.set('ge_region', 'fa');
    params.set('lang', 'fa-IR');
    await this.page.goto(`${pathname}?${params.toString()}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Opens an English signed-out page, then uses the visible locale selector to
   * enter Farsi Global Edition. This mirrors the Cucumber region-switch setup.
   *
   * @param path - non-regional dashboard path
   */
  async gotoSignedOutFa(path: string): Promise<void> {
    await this.page.goto(`${path}?lang=en-US`, {waitUntil: 'domcontentloaded'});
    await Promise.all([
      this.page.waitForURL(new RegExp(`/fa${path}\\?lang=fa-IR`), {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      }),
      this.page.locator('#locale').evaluate(selectElement => {
        const select = selectElement as HTMLSelectElement;
        select.value = 'fa-IR';
        select.form?.submit();
      }),
    ]);
  }

  /**
   * Returns a button by exact-ish visible text.
   *
   * @param text - visible button text
   */
  button(text: string): Locator {
    return this.page.getByRole('button', {name: new RegExp(text)});
  }

  /**
   * Asserts the page is rendered in Farsi Global Edition.
   */
  async expectFarsiDocument(): Promise<void> {
    await expect(
      this.page.locator("html[lang='fa-IR'][data-ge-region='fa']"),
    ).toBeVisible({timeout: 30_000});
  }
}
