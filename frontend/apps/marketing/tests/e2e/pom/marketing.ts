import {type Page} from '@playwright/test';

import {loadFonts, FONT_FAMILY_NAMES} from '@code-dot-org/fonts';

export interface MarketingPageOptions {
  locale?: string;
  isPreview?: boolean;
}

export class MarketingPage {
  readonly locale: string | undefined;
  readonly isPreview: boolean;
  readonly page: Page;

  constructor(page: Page, options?: MarketingPageOptions) {
    this.page = page;
    this.locale = options?.locale;
    this.isPreview = options?.isPreview ?? false;
  }

  async enableDraftMode(token: string, slug: string) {
    return await this.page.goto(
      `${this.getBaseUrl()}/api/draft?token=${token}&slug=${slug}&locale=${this.locale}`,
    );
  }

  getBaseDomain() {
    const domain = process.env.APPLICATION_BASE_ADDRESS;

    if (!domain) {
      console.warn(
        'No domain specified, defaulting to code.marketing-sites.localhost!',
      );

      return this.isPreview
        ? 'preview-code.marketing-sites.localhost:3001'
        : 'code.marketing-sites.localhost:3001';
    }

    return this.isPreview ? `preview-${domain}` : domain;
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
        return `http://${this.getBaseDomain()}`;
      case 'test':
      case 'production':
        return `https://${this.getBaseDomain()}`;
    }
  }

  getCookieDomain() {
    const baseDomain = this.getBaseDomain();

    // Remove the port number if it exists, e.g. "localhost:3001" becomes "localhost"
    return baseDomain.replace(/:\d+$/, '');
  }

  getBasePath() {
    if (this.locale) {
      return `${this.getBaseUrl()}/${this.locale}`;
    }

    return this.getBaseUrl();
  }

  async goto(subPath: string) {
    await this.loadFonts();

    const response = await this.page.goto(`${this.getBasePath()}${subPath}`);

    await this.page.evaluate(() => window.__fontsLoadedPromise);

    return response;
  }

  async loadFonts() {
    // Inject Font Loader script to the browser context and wait for fonts to be loaded
    await this.page.addInitScript({
      content: `
      window.__fontsLoadedPromise = (${loadFonts.toString()})(${JSON.stringify(FONT_FAMILY_NAMES)}).then(() => {
        console.log('[Test Runner] all fonts loaded!');
      });
      `,
    });
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
