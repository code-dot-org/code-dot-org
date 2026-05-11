import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page Object for AI Chat Lab.
 */
export class Aichat {
  /** Browser page containing AI Chat Lab. */
  readonly page: Page;

  /** Chat prompt textarea. */
  readonly textarea: Locator;

  /** Chat submit button. */
  readonly submitButton: Locator;

  /** Upload dropdown button. */
  readonly uploadDropdown: Locator;

  /** Bot chat message bubbles. */
  readonly botMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textarea = page.locator('#uitest-chat-textarea');
    this.submitButton = page.locator('#uitest-chat-submit');
    this.uploadDropdown = page.locator('#uploadDropdown-dropdown-button');
    this.botMessages = page.locator("[aria-label='AI bot chat message']");
  }

  /**
   * Navigate to an AI Chat Lab level and clear startup UI.
   *
   * @param level - lesson 47 level number
   */
  async gotoLevel(level: number): Promise<void> {
    await this.page.goto(
      `/courses/allthethingscourse/units/1/lessons/47/levels/${level}`,
    );
    await this.closeStartupDialog();
    await this.dismissTeacherPanel();
  }

  /**
   * Dismiss the startup close-dialog if it appears.
   */
  async closeStartupDialog(): Promise<void> {
    const closeDialog = this.page.locator('#ui-close-dialog');
    try {
      await closeDialog.waitFor({state: 'visible', timeout: 15_000});
      await closeDialog.click();
      await closeDialog.waitFor({state: 'hidden', timeout: 10_000});
    } catch {
      // The dialog is optional on reloads and some level configurations.
    }
  }

  /**
   * Dismiss the teacher panel if it is visible.
   */
  async dismissTeacherPanel(): Promise<void> {
    const hideHandle = this.page.locator(
      '.teacher-panel > .hide-handle > .fa-chevron-right',
    );
    if (await hideHandle.isVisible()) {
      await hideHandle.click();
      await this.page
        .locator('.teacher-panel > .show-handle > .fa-chevron-left')
        .waitFor({state: 'visible', timeout: 10_000});
    }
  }

  /**
   * Send a chat prompt and wait for the next visible bot message.
   *
   * @param prompt - prompt text to send
   */
  async sendPrompt(prompt: string): Promise<Locator> {
    const existingBotMessages = await this.botMessages.count();

    await this.textarea.waitFor({state: 'visible', timeout: 30_000});
    await this.textarea.fill(prompt);
    await expect(this.submitButton).toBeEnabled({timeout: 10_000});
    await this.submitButton.click();

    await expect
      .poll(() => this.botMessages.count(), {timeout: 60_000})
      .toBeGreaterThan(existingBotMessages);

    return this.botMessages.last();
  }

  /**
   * Attach a file from the AI Chat Lab library picker.
   *
   * @param fileName - exact library file name to select
   */
  async attachFileFromLibrary(fileName: string): Promise<void> {
    await this.uploadDropdown.click();
    await this.page.locator('button', {hasText: 'From Library'}).click();

    const checkbox = this.page.locator(`input[name='select-${fileName}']`);
    await checkbox.waitFor({state: 'visible', timeout: 30_000});
    await checkbox.check();

    const attachButton = this.page
      .locator('button', {hasText: 'Attach'})
      .last();
    await expect(attachButton).toBeEnabled({timeout: 10_000});
    await attachButton.click();
    await checkbox.waitFor({state: 'detached', timeout: 15_000});
  }
}
