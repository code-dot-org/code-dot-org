import {expect, type Page} from '@playwright/test';

const LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/9/levels/3?noautoplay=true';

/**
 * Page object for the submittable multi-choice level.
 */
export class MultiSubmittablePage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the level and waits for the submit controls.
   */
  async goto(): Promise<void> {
    await this.page.goto(LEVEL_URL);
    await this.page
      .locator('.submitButton')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  }

  /**
   * Verifies the source scenario's question text.
   */
  async expectQuestion(): Promise<void> {
    await expect(this.page.locator('.multi-question')).toHaveText(
      'What is your favorite color?',
    );
  }

  /**
   * Verifies both submit buttons are disabled.
   */
  async expectSubmitDisabled(): Promise<void> {
    await expect(this.page.locator('.submitButton').first()).toBeDisabled();
    await expect(this.page.locator('.submitButton').last()).toBeDisabled();
  }

  /**
   * Selects the answer by index and waits for its visible selected mark.
   *
   * @param answerIndex - answer button index
   */
  async selectAnswer(answerIndex: number): Promise<void> {
    await this.page.locator(`.answerbutton[index="${answerIndex}"]`).click();
    await expect(this.page.locator(`#checked_${answerIndex}`)).toBeVisible();
  }

  /**
   * Submits the level and waits for the confirmation modal.
   */
  async submit(): Promise<void> {
    await expect(this.page.locator('.submitButton').first()).toBeEnabled();
    await this.page.locator('.submitButton').first().click();
    await this.page.locator('.modal').waitFor({state: 'visible'});
  }

  /**
   * Reloads the page and verifies submitted state.
   */
  async reloadAndExpectUnsubmitState(): Promise<void> {
    const unsubmitButton = this.page.locator('.unsubmitButton').first();

    await expect(async () => {
      await this.page.reload();
      await expect(unsubmitButton).toBeVisible({timeout: 15_000});
    }).toPass({timeout: 60_000});

    await expect(this.page.locator('.unsubmitButton').first()).toBeVisible();
    await expect(this.page.locator('.submitButton').first()).not.toBeVisible();
    await expect(this.page.locator('.submitButton').last()).not.toBeVisible();
  }

  /**
   * Unsubmits the level through the confirmation dialog.
   */
  async unsubmit(): Promise<void> {
    await this.page.locator('.unsubmitButton').first().click();
    await this.page.locator('.modal').waitFor({state: 'visible'});
    const okButton = this.page
      .locator('.modal')
      .getByRole('button', {name: /^ok/i});
    await okButton.waitFor({state: 'visible', timeout: 15_000});
    await okButton.click();
  }

  /**
   * Verifies submit controls returned to enabled editable state.
   */
  async expectEditableSubmitState(): Promise<void> {
    await this.page
      .locator('.submitButton')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(this.page.locator('.submitButton').first()).toBeEnabled();
    await expect(this.page.locator('.submitButton').last()).toBeEnabled();
  }
}
