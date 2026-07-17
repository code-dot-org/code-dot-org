import {type Locator, type Page} from '@playwright/test';

import {BasePage} from '../pages/base-page';

/**
 * Public, anonymous-accessible programming-environment documentation pages
 * (/docs/ and /docs/ide/<environment>/). Server-rendered by Rails with no
 * client-side data fetch, so content is present as soon as the document loads.
 */
export class DocumentationPage extends BasePage {
  /** The <main> landmark. On every docs page, three elements share the class
   * ".container" (header wrapper, main-content wrapper, footer wrapper); the
   * "main" role uniquely disambiguates the one that carries the page content. */
  readonly mainContent: Locator;

  /**
   * The page's primary <h1>. Markdown-sourced doc content can embed its own
   * `#` headings, so this takes the first h1 on the page — matching the
   * Cucumber feature's own "h1:first" selector.
   */
  readonly heading: Locator;

  /**
   * Programming-environment sidebar category list (only present on
   * /docs/ide/<environment>/ pages). No accessible role distinguishes it from
   * .page-content — both are plain divs inside <main> — so this falls back to
   * the Cucumber feature's own CSS selector, confirmed unique on the page.
   */
  readonly navBar: Locator;

  /**
   * Programming-environment article body (only present on
   * /docs/ide/<environment>/ pages). Same accessibility-gap rationale as navBar.
   */
  readonly pageContent: Locator;

  constructor(page: Page) {
    super(page);
    this.mainContent = page.getByRole('main');
    this.heading = page.getByRole('heading', {level: 1}).first();
    this.navBar = page.locator('.nav-bar');
    this.pageContent = page.locator('.page-content');
  }

  /** Navigate to the documentation landing page listing all IDEs. */
  async gotoLandingPage(): Promise<void> {
    await this.goto({path: '/docs/'});
  }

  /** Navigate to a specific programming environment's documentation page. */
  async gotoProgrammingEnvironmentDocs(slug: string): Promise<void> {
    await this.goto({path: `/docs/ide/${slug}/`});
  }
}
