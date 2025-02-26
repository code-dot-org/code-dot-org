import {type Page} from '@playwright/test';
export class MarketingPage {
  readonly locale: string;
  readonly page: Page;

  constructor(page: Page, locale: string) {
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
    return `${this.getBaseUrl()}/${this.locale}`;
  }

  async goto(subPath: string) {
    await this.page.goto(`${this.getBasePath()}${subPath}`);

    // Wait for fonts to load before proceeding.
    await this.page.waitForFunction(() => document.fonts.ready);
  }
}
