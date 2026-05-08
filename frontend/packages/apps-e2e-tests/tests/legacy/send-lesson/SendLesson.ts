import {type Page} from '@playwright/test';

/**
 * Page object for the "Send Lesson" feature on a unit overview page.
 *
 * The send-lesson buttons are rendered as `.uitest-sendlesson` elements; one
 * per lesson in the unit.  Clicking the first child of the Nth button opens
 * the modal.
 *
 * Mirrors `I open the send lesson dialog for lesson N` from
 * lesson_management_steps.rb.
 */
export class SendLessonPage {
  /** Playwright page whose context is signed in as a teacher. */
  readonly page: Page;

  /** @param page - Playwright page holding the teacher session */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the allthethingscourse unit 1 overview page.
   * Most send-lesson tests use this unit.
   */
  async gotoUnitOverview(): Promise<void> {
    await this.page.goto('/courses/allthethingscourse/units/1');
    await this.page
      .locator('.uitest-sendlesson')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  }

  /**
   * Open the send-lesson modal for the given 1-based lesson number.
   * Waits for the modal to become visible before returning.
   *
   * @param lessonNum - 1-based lesson index within the current unit
   */
  async openDialog(lessonNum: number): Promise<void> {
    const btn = this.page.locator('.uitest-sendlesson').nth(lessonNum - 1);
    await btn.waitFor({state: 'visible', timeout: 15_000});
    await btn.locator('> *').first().click();
    await this.page
      .locator('.modal')
      .waitFor({state: 'visible', timeout: 15_000});
  }

  /** The send-lesson modal locator. */
  get modal() {
    return this.page.locator('.modal');
  }

  /** The "Done" button inside the modal. */
  get doneButton() {
    return this.page.getByRole('button', {name: 'Done'});
  }

  /** The copy-link button inside the modal. */
  get copyButton() {
    return this.page.locator('#uitest-copy-button');
  }

  /** "Link copied!" confirmation text (span label next to the copy button). */
  get copiedConfirmation() {
    return this.page.locator('span').filter({hasText: 'Link copied!'});
  }
}
