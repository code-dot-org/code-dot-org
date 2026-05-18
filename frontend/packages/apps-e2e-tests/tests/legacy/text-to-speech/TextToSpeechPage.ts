import {type Locator, type Page} from '@playwright/test';

import {expect} from '../../shared/fixtures';

/**
 * Page object for text-to-speech player checks.
 */
export class TextToSpeechPage {
  readonly page: Page;
  readonly inlineAudio: Locator;
  readonly csfTopInstructionsAudio: Locator;
  readonly runButton: Locator;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
    this.inlineAudio = page.locator('.inline-audio');
    this.csfTopInstructionsAudio = page.locator(
      '.csf-top-instructions .inline-audio',
    );
    this.runButton = page.locator('#runButton');
  }

  /**
   * Opens a level and waits for the visible lab chrome.
   *
   * @param url - level URL path
   */
  async openLevel(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page
      .locator('#visualization, #runButton, .inline-audio')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
  }

  /**
   * Verifies the total number of inline audio controls.
   *
   * @param count - expected audio control count
   */
  async expectInlineAudioCount(count: number): Promise<void> {
    await expect(this.inlineAudio.first()).toBeVisible({timeout: 30_000});
    await expect(this.inlineAudio).toHaveCount(count);
  }

  /**
   * Runs the CSF level and waits for feedback audio controls to appear.
   */
  async runCsfLevel(): Promise<void> {
    await expect(this.runButton).toBeVisible({timeout: 30_000});
    await expect(this.csfTopInstructionsAudio).not.toBeAttached();
    await this.runButton.dispatchEvent('click');
    await expect(
      this.page.locator('.uitest-topInstructions-inline-feedback'),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Verifies the number of CSF top-instructions inline audio controls.
   *
   * @param count - expected audio control count
   */
  async expectCsfTopInstructionsAudioCount(count: number): Promise<void> {
    await expect(this.csfTopInstructionsAudio).toHaveCount(count, {
      timeout: 30_000,
    });
  }
}
