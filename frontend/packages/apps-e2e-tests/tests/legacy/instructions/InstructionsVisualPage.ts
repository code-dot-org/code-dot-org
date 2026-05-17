import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for top-instructions visual smoke ports.
 */
export class InstructionsVisualPage {
  readonly page: Page;
  readonly runButton: Locator;
  readonly topInstructions: Locator;
  readonly lightbulb: Locator;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
    this.runButton = page.locator('#runButton');
    this.topInstructions = page.locator('.csf-top-instructions');
    this.lightbulb = page.locator('#lightbulb');
  }

  /**
   * Opens an allthethingscourse level and waits for visible lab readiness.
   *
   * @param lesson - lesson number
   * @param level - level number
   * @param query - optional URL query string
   */
  async openAllTheThingsLevel(
    lesson: number,
    level: number,
    query = '?noautoplay=true',
  ): Promise<void> {
    await this.page.goto(
      `/courses/allthethingscourse/units/1/lessons/${lesson}/levels/${level}${query}`,
    );
    await this.expectLabReady();
  }

  /**
   * Opens a course level and waits for visible lab readiness.
   *
   * @param course - course name
   * @param level - level number
   */
  async openHocCourseLevel(course: string, level: number): Promise<void> {
    await this.page.goto(
      `/courses/${course}/units/1/lessons/1/levels/${level}?noautoplay=true`,
    );
    await this.expectLabReady();
  }

  /**
   * Waits for visible lab and instruction controls.
   */
  async expectLabReady(): Promise<void> {
    await this.waitForAnyVisible(
      '#runButton, .csf-top-instructions, .editor-column, #visualization',
    );
    await this.dismissInstructionsOverlayIfPresent();
    await this.waitForCodeStudioHeaderReady();
    await this.waitForAnyVisible('.csf-top-instructions, .editor-column');
  }

  /**
   * Waits for the Code Studio level header and progress bubbles when present.
   * These elements are part of the lab page this POM owns, not the shared
   * screenshot fixture.
   */
  async waitForCodeStudioHeaderReady(): Promise<void> {
    const header = this.page.locator('.header_level').first();
    if (!(await header.isVisible({timeout: 1_000}).catch(() => false))) {
      return;
    }

    await expect(this.page.locator('#header_middle_content')).toBeVisible({
      timeout: 30_000,
    });

    const progressContainer = this.page
      .locator('#lesson_progress_container')
      .first();
    if (
      !(await progressContainer.isVisible({timeout: 1_000}).catch(() => false))
    ) {
      return;
    }

    await expect(
      this.page.locator('.header_level .progress-bubble').first(),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Opens the next hint prompt and accepts it.
   */
  async acceptNextHint(): Promise<void> {
    const yesButton = this.topInstructions.getByRole('button', {name: 'Yes'});
    if (!(await yesButton.isVisible({timeout: 1_000}).catch(() => false))) {
      await this.lightbulb.click();
    }
    await expect(yesButton).toBeVisible({timeout: 15_000});
    await yesButton.evaluate(element => (element as HTMLElement).click());
  }

  /**
   * Sets top-instruction panes to a deterministic scroll position before a
   * visual checkpoint. Hint insertion can otherwise leave the browser at a
   * different auto-scrolled offset between runs.
   *
   * @param position - scroll target inside the top instructions pane
   */
  async stabilizeInstructionScroll(
    position: 'top' | 'bottom' = 'top',
  ): Promise<void> {
    await this.topInstructions.evaluateAll((elements, scrollPosition) => {
      for (const element of elements) {
        element.scrollTop =
          scrollPosition === 'bottom' ? element.scrollHeight : 0;
      }
    }, position);
  }

  /**
   * Resizes top instructions by dragging the resizer down.
   */
  async expandTopInstructions(): Promise<void> {
    const resizer = this.page.locator('#ui-test-resizer');
    await expect(resizer).toBeVisible({timeout: 15_000});
    const box = await resizer.boundingBox();
    if (!box) throw new Error('top instructions resizer not found');
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width / 2, box.y + 200, {
      steps: 10,
    });
    await this.page.mouse.up();
  }

  /**
   * Clicks a top-instructions tab.
   *
   * @param selector - tab selector
   */
  async clickTab(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  /**
   * Dismisses the first-load instructions curtain if present.
   */
  private async dismissInstructionsOverlayIfPresent(): Promise<void> {
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible({timeout: 1_000}).catch(() => false)) {
      await overlay.evaluate(element => (element as HTMLElement).click());
      await overlay.waitFor({state: 'hidden', timeout: 10_000});
    }
  }

  /**
   * Waits until any element matching a selector is visible.
   *
   * @param selector - CSS selector list to query
   */
  private async waitForAnyVisible(selector: string): Promise<void> {
    await this.page.waitForFunction(
      cssSelector =>
        Array.from(document.querySelectorAll(cssSelector)).some(element => {
          const style = window.getComputedStyle(element);
          const box = element.getBoundingClientRect();
          return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            box.width > 0 &&
            box.height > 0
          );
        }),
      selector,
      {timeout: 60_000},
    );
  }
}
