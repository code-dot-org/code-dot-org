import {type Locator, type Page} from '@playwright/test';

import {getAllTheThingsPagePath} from '../config/path';

import {MarketingPage, MarketingPageOptions} from './marketing';

export type Section =
  | 'Column'
  | 'Container'
  | 'People Collection'
  | 'Rich Text';

export class AllTheThingsPage extends MarketingPage {
  constructor(page: Page, options: MarketingPageOptions) {
    super(page, options);
  }

  async enableDraftMode(token: string = 'ci-draft-mode') {
    return await super.enableDraftMode(token, 'engineering/all-the-things');
  }

  async goto(path?: string) {
    if (!path) {
      return await super.goto(`${await getAllTheThingsPagePath()}?otgeo=us`);
    }

    return await super.goto(path);
  }

  getSectionLocator(heading: Section): Locator {
    // Find the section with the heading
    const headingLocator = this.page.getByRole('heading', {
      name: heading,
      exact: true,
    });

    // Go through the top-level sections, finding the one that has this heading
    return this.page.locator('div').filter({has: headingLocator}).first();
  }
}
