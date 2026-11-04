import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/**
 * Page object for AI Chat Lab.
 *
 * DOM contract:
 * - #uitest-chat-textarea and #uitest-chat-submit are the chat input and its
 *   send button (apps/src/aichat/views/).
 * - The assistant's replies carry aria-label "AI bot chat message"
 *   (apps/src/aiComponentLibrary/chatMessage/).
 */
export class AichatLab extends LessonLevelPage {
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly botMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.chatInput = page.locator('#uitest-chat-textarea');
    this.sendButton = page.locator('#uitest-chat-submit');
    this.botMessages = page.locator('[aria-label="AI bot chat message"]');
  }

  /**
   * Open a level, appending extra query parameters to the usual level URL.
   * The first-load dialog that covers the chat is closed whenever it shows.
   */
  async gotoLevel(
    {course, lesson, level}: {course: string; lesson: number; level: number},
    query: Record<string, string> = {},
  ): Promise<void> {
    await this.page.addLocatorHandler(
      this.page.getByRole('button', {name: 'Close', exact: true}),
      async closeButton => closeButton.click(),
    );
    const url = new URL(
      labLevelUrl({course, lesson, level}),
      'http://placeholder',
    );
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
    await this.page.goto(`${url.pathname}${url.search}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(this.chatInput).toBeVisible();
  }

  async sendMessage(text: string): Promise<void> {
    await this.chatInput.fill(text);
    await expect(this.sendButton).toBeEnabled();
    await this.sendButton.click();
  }
}
