import {type Locator, type Page} from '@playwright/test';

import {MarketingPage, MarketingPageOptions} from './marketing';

export type Section =
  | 'Action Block'
  | 'Action Block Carousel'
  | 'Full Width Action Block'
  | 'Action Block Pattern Default'
  | 'Action Block Pattern Hidden Elements'
  | 'Button'
  | 'Divider'
  | 'Editorial Card'
  | 'FAQ Accordion'
  | 'Hero Banner Basic'
  | 'Hero Banner with Background Color'
  | 'Hero Banner with Background Image'
  | 'Hero Banner with Image Big'
  | 'Hero Banner with Image Small'
  | 'Hero Banner with Video'
  | 'Hero Banner with Partner Callout'
  | 'Hero Banner with Announcement Banner'
  | 'Heading'
  | 'Image'
  | 'Image Carousel'
  | 'Localization'
  | 'Overline'
  | 'Paragraph'
  | 'Rich Text'
  | 'Section - Pattern Dark'
  | 'Section - Pattern Teal'
  | 'Text Link'
  | 'Video'
  | 'Video Carousel';

export class AllTheThingsPage extends MarketingPage {
  constructor(page: Page, options: MarketingPageOptions) {
    super(page, options);
  }

  async enableDraftMode(token: string = 'ci-draft-mode') {
    return await super.enableDraftMode(token, 'engineering/all-the-things');
  }

  async goto(path?: string) {
    if (!path) {
      return await super.goto('/engineering/all-the-things?otgeo=us');
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
