import {type Locator, type Page} from '@playwright/test';

import {MarketingPage} from './marketing';

export type Section =
  | 'Action Block'
  | 'Action Block Carousel'
  | 'Full Width Action Block'
  | 'Button'
  | 'Divider'
  | 'Editorial Card'
  | 'Heading'
  | 'Image'
  | 'Image Carousel'
  | 'Localization'
  | 'Overline'
  | 'Paragraph'
  | 'Section - Pattern Dark'
  | 'Section - Pattern Teal'
  | 'Text Link'
  | 'Video'
  | 'Video Carousel';

export class AllTheThingsPage extends MarketingPage {
  constructor(page: Page, locale: string) {
    super(page, locale);
  }

  async enableDraftMode(token: string = 'ci-draft-mode') {
    return await super.enableDraftMode(token, 'engineering/all-the-things');
  }

  async goto(path?: string) {
    if (!path) {
      return await super.goto('/engineering/all-the-things');
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
    return this.page.locator('section').filter({has: headingLocator});
  }
}
