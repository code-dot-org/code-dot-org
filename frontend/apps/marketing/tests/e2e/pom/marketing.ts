import {type Page} from '@playwright/test';

import {loadFonts, FONT_FAMILY_NAMES} from '@code-dot-org/fonts';

export class MarketingPage {
  readonly locale: string | undefined;
  readonly page: Page;

  constructor(page: Page, locale?: string) {
    this.page = page;
    this.locale = locale;
  }

  getBaseUrl() {
    const stage = process.env.STAGE;

    if (!stage) {
      console.error('No stage specified!');

      throw new Error('Missing environment variable STAGE');
    }

    switch (stage) {
      default:
      case 'localhost':
      case 'pr':
        return 'http://localhost:3001';
      case 'test':
        return 'https://dev.marketing.dev-code.org';
      case 'production':
        return 'https://code.org';
    }
  }

  getBasePath() {
    if (this.locale) {
      return `${this.getBaseUrl()}/${this.locale}`;
    }

    return this.getBaseUrl();
  }

  async goto(subPath: string) {
    await this.page.goto(`${this.getBasePath()}${subPath}`);

    await this.loadFonts();
  }

  async loadFonts() {
    // Inject Font Loader to the browser context and wait for fonts to be loaded
    await this.page.evaluate(
      ({fn, fonts}) => {
        const injectedLoadFonts = new Function(`return (${fn})`)();

        return injectedLoadFonts(fonts).then(() =>
          console.log('[Test Runner] all fonts loaded!'),
        );
      },
      {fn: loadFonts.toString(), fonts: FONT_FAMILY_NAMES},
    );
  }

  async getMetatag(name: string) {
    return this.page.locator(`meta[name="${name}"]`)?.getAttribute('content');
  }

  async getOpenGraph(name: string) {
    return this.page
      .locator(`meta[property="og:${name}"]`)
      ?.getAttribute('content');
  }

  get pageTitle() {
    return this.page.title();
  }

  get description() {
    return this.getMetatag('description');
  }

  get robots() {
    return this.getMetatag('robots');
  }
}
