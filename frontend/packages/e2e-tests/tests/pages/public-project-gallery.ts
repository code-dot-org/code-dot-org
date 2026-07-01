import {type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/**
 * The /projects/public gallery page.
 *
 * Locator strategy is deliberately mixed:
 *  - the page heading has a stable, locale-independent accessible name
 *    ("Projects"), so it uses getByRole;
 *  - the gallery container and project-type-area wrapper are bare <div>s
 *    with no role, name, or list semantics — #uitest-public-projects and
 *    .ui-project-app-type-area are the only handles, matching the source
 *    step definitions' jQuery selectors (steps.rb / project_steps.rb);
 *  - .ui-featured is the one project-type-area PublicGallery.jsx ever
 *    synthesizes (mapProjectData always produces a single "featured" key),
 *    so its count is a structural constant, not a data-population check.
 */
export class PublicProjectGallery extends BasePage {
  /** The "Projects" page heading (h1). */
  readonly pageHeading: Locator;

  /** #uitest-public-projects — the public gallery container. */
  readonly publicProjectsSection: Locator;

  /** .ui-project-app-type-area — one wrapper div per lab-type key. */
  readonly projectAppTypeAreas: Locator;

  /** .ui-featured — the "Featured Projects" area (the only key PublicGallery.jsx renders). */
  readonly featuredProjectsSection: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', {level: 1, name: 'Projects'});
    this.publicProjectsSection = page.locator('#uitest-public-projects');
    this.projectAppTypeAreas = page.locator('.ui-project-app-type-area');
    this.featuredProjectsSection = page.locator('.ui-featured');
  }

  /** Navigate to /projects/public (anonymous, no locale prefix). */
  async goto(): Promise<void> {
    await this.page.goto('/projects/public', {waitUntil: 'domcontentloaded'});
  }
}
