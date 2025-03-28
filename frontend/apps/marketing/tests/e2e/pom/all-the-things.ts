import {type Locator, type Page} from '@playwright/test';

import {MarketingPage} from './marketing';

type Section =
  | 'Button'
  | 'Divider'
  | 'Heading'
  | 'Image'
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

  async goto() {
    await super.goto('/all-the-things');
  }

  getSectionLocator(heading: Section): Locator {
    // Find the section with the heading
    const headingLocator = this.page.getByRole('heading', {name: heading});

    // Go through the top-level sections, finding the one that has this heading
    return this.page.locator('section').filter({has: headingLocator});
  }
}
