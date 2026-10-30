import {type Locator, type Page} from '@playwright/test';

import {BasePage} from '../pages/base-page';

/** Public docs pages: the landing (/docs/) and per-environment IDE docs (/docs/ide/<env>/). */
export class DocumentationPage extends BasePage {
  /** First h1: markdown doc bodies can embed their own h1 headings. */
  readonly heading: Locator;

  /** navBar and pageContent share no distinguishing ARIA role; the CSS class is the handle. */
  readonly navBar: Locator;
  readonly pageContent: Locator;

  /** axe's include() needs a CSS string, not the navBar locator. */
  readonly navBarSelector = '.nav-bar';

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', {level: 1}).first();
    this.navBar = page.locator(this.navBarSelector);
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
