import {type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/** Page object for /projects/public (the public gallery). */
export class PublicProjectGalleryPage extends BasePage {
  readonly pageHeading: Locator;
  readonly publicProjectsSection: Locator;
  readonly projectAppTypeAreas: Locator;
  readonly featuredProjectsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', {level: 1, name: 'Projects'});
    this.publicProjectsSection = page.locator('#uitest-public-projects');
    this.projectAppTypeAreas = page.locator('.ui-project-app-type-area');
    this.featuredProjectsHeading = page.getByRole('heading', {
      level: 2,
      name: 'Featured Projects',
    });
  }

  async goto(): Promise<void> {
    await this.page.goto('/projects/public', {waitUntil: 'domcontentloaded'});
  }
}
