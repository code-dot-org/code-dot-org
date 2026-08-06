import {expect, type Locator, type Page} from '@playwright/test';

/**
 * The demo "practice section" card on the teacher homepage, shown to teachers
 * with zero real sections behind ?enableExperiments=demo-section. Not a page.
 */
export class DemoSectionCardComponent {
  /** By id: the card is an <li> wrapper with no accessible role or name. */
  readonly card: Locator;

  readonly lessonDropdownButton: Locator;

  readonly lessonDropdownItems: Locator;

  readonly progressAction: Locator;

  /** Raw selectors too: axe's include() needs CSS strings, not locators. */
  readonly cardSelector = '#ui-test-demo-section-card';
  readonly lessonDropdownSelector = '#go-to-lesson-dropdown';

  constructor(page: Page) {
    this.card = page.locator(this.cardSelector);
    // CustomDropdown derives this name from its name="go-to-lesson" prop.
    this.lessonDropdownButton = this.card.getByRole('button', {
      name: 'go-to-lesson filter dropdown',
    });
    this.lessonDropdownItems = this.card
      .locator(this.lessonDropdownSelector)
      .getByRole('listitem');
    this.progressAction = this.card.locator(
      '#ui-test-demo-section-action-progress',
    );
  }

  async openLessonDropdown(): Promise<void> {
    await this.lessonDropdownButton.click();
    await expect(this.lessonDropdownItems.first()).toBeVisible();
  }
}
