import {type Page} from '@playwright/test';

/**
 * Page Object for the Mix & Move with AI course.
 *
 * The course lives at /courses/mix-move-ai-2025/units/1/lessons/1/levels/{N}.
 * Uses the lab2 framework — level navigation via the progress header, AI
 * generation dialogs, and #instructions-continue-button to advance.
 *
 * Note: URL does NOT include ?noautoplay=true — the course auto-starts.
 */
export class MixMoveAI {
  /** Underlying Playwright page. */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Build the relative URL for a lesson 1 level in mix-move-ai-2025. */
  levelUrl(level: number): string {
    return `/courses/mix-move-ai-2025/units/1/lessons/1/levels/${level}`;
  }

  /** Navigate to a level (full navigation, resets session). */
  async gotoLevel(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(this.levelUrl(level));
  }

  /**
   * Click the progress-header level bubble to navigate to a specific level.
   * Uses the title attribute set by the header component.
   *
   * @param level - level number to navigate to
   * @param lessonName - lesson name as it appears in the bubble title
   */
  async clickHeaderLevel(level: number, lessonName: string): Promise<void> {
    const title = `Level ${level} Lesson ${lessonName}`;
    await this.page.locator(`[title="${title}"]`).click();
  }

  /** Press the lab2 continue button to advance to the next level. */
  async continue(): Promise<void> {
    await this.page.locator('#instructions-continue-button').click();
  }

  /**
   * Select an option by label in a <select> dropdown.
   *
   * @param dropdownId - the `id` attribute of the <select> element
   * @param label - visible option text to select
   */
  async selectOption(dropdownId: string, label: string): Promise<void> {
    await this.page.selectOption(`#${dropdownId}`, {label});
  }

  /**
   * Dispatch pointerdown + pointerup on a Blockly editable field.
   * Required to open field editors (sounds panel, colour picker, etc.) in the
   * Blockly SVG canvas, consistent with the WebKit-compatible dispatch used
   * elsewhere in the suite.
   *
   * @param selector - CSS selector for the .blocklyEditableField element
   */
  async clickBlockField(selector: string): Promise<void> {
    const field = this.page.locator(selector).first();
    await field.dispatchEvent('pointerdown', {bubbles: true});
    await field.dispatchEvent('pointerup', {bubbles: true});
  }

  /**
   * Click the last block inside a given parent block selector.
   * Mirrors `I click block ".Parent .blocklyBlock:last"` from the Cucumber suite.
   *
   * @param parentSelector - CSS selector for the parent block container
   */
  async clickLastBlockIn(parentSelector: string): Promise<void> {
    await this.page.locator(`${parentSelector} .blocklyBlock`).last().click();
  }
}
