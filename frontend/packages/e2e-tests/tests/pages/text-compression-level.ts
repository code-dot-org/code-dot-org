import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/** The widget renders inline into #widgetMain, not an iframe. */
export class TextCompressionLevel extends LessonLevelPage {
  /** Widget root; a11y scans scope here rather than the shared chrome. */
  readonly rootSelector = '#widgetMain';

  /** CSS because the inner textbox has no accessible name; see eyes.spec.ts. */
  readonly dictionaryEditor: Locator;

  constructor(page: Page) {
    super(page);
    this.dictionaryEditor = page.locator('#symbolEditorWrapper');
  }

  /** Leaves the auto-opened instructions dialog up, as the source does. */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await expect(this.dictionaryEditor).toBeVisible();
  }

  /** Drives window.editor directly, mirroring steps.rb's `editor.setValue`. */
  async setDictionaryText(text: string): Promise<void> {
    await this.page.evaluate(value => {
      const {editor} = window as unknown as {
        editor: {setValue(value: string): void};
      };
      editor.setValue(value);
    }, text);
    const [firstLine] = text.split('\n');
    await expect(this.dictionaryEditor).toContainText(firstLine);
  }
}
