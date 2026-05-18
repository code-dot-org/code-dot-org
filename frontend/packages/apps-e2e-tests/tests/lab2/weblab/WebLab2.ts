import {
  expect,
  type FrameLocator,
  type Locator,
  type Page,
} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {Lab2Lab} from '../shared/Lab2Lab';

/**
 * Page Object for Web Lab 2, lesson 51 of allthethingscourse.
 */
export class WebLab2 extends Lab2Lab {
  /** Instructions drawer visible in the resource panel. */
  readonly instructionsDrawer: Locator;

  /** File list panel for Codebridge files. */
  readonly filesList: Locator;

  /** CodeMirror editor container. */
  readonly editorContainer: Locator;

  /** Outer preview iframe. */
  readonly previewFrame: FrameLocator;

  /** Refresh button in the preview toolbar. */
  readonly refreshPreviewButton: Locator;

  /** Inner iframe that renders the student's HTML. */
  readonly innerPreviewFrame: FrameLocator;

  /** Hello-world element from the source HTML. */
  readonly helloWorldMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.instructionsDrawer = page.locator('#instructions-drawer');
    this.filesList = page.locator('#uitest-files-list');
    this.editorContainer = page.locator('.codemirror-container');
    this.previewFrame = page.frameLocator('#preview');
    this.refreshPreviewButton = page.getByRole('button', {name: 'Refresh'});
    this.innerPreviewFrame = this.previewFrame.frameLocator('#inner-preview');
    this.helloWorldMessage = this.innerPreviewFrame.locator(
      '#hello-world-message',
    );
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(51, level) + '&hideProductTours=true';
  }

  /**
   * Wait for the visible Lab2 shell used by Web Lab 2.
   */
  protected async waitForReady(): Promise<void> {
    await this.instructionsDrawer.waitFor({state: 'visible', timeout: 60_000});
  }

  /**
   * Assert the instructions, file list, and editor have mounted.
   */
  async expectEditorLoaded(): Promise<void> {
    await expect(this.instructionsDrawer).toContainText(
      'This is the level for a basic Web Lab 2 UI Test.',
    );
    await expect(this.filesList).toContainText('index.html');
    await expect(this.editorContainer).toContainText('Hello world!');
  }

  /**
   * Assert the rendered page is available inside the nested preview iframes.
   */
  async expectPreviewLoaded(): Promise<void> {
    await expect(this.page.locator('#preview')).toBeVisible({timeout: 60_000});
    await expect(this.refreshPreviewButton).toBeVisible();
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await this.previewHasHelloWorld()) {
        break;
      }
      await this.refreshPreviewButton.click();
    }
    await expect(this.helloWorldMessage).toContainText('Hello world!', {
      timeout: 60_000,
    });
  }

  /**
   * Check whether the nested preview has rendered the hello-world element.
   */
  private async previewHasHelloWorld(): Promise<boolean> {
    return this.helloWorldMessage
      .waitFor({state: 'visible', timeout: 20_000})
      .then(() => true)
      .catch(() => false);
  }
}
