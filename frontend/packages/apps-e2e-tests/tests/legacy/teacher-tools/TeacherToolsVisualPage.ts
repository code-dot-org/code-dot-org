import {type Locator, type Page} from '@playwright/test';

import {expect} from '../../shared/fixtures';

/**
 * Page object for small teacher-tools visual readiness ports.
 */
export class TeacherToolsVisualPage {
  readonly page: Page;
  readonly lessonOverview: Locator;
  readonly belowVisualization: Locator;
  readonly visualizationResizeBar: Locator;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
    this.lessonOverview = page.locator('.lesson-overview');
    this.belowVisualization = page.locator('#belowVisualization');
    this.visualizationResizeBar = page.locator('#visualizationResizeBar');
  }

  /**
   * Opens the printable lesson plan and waits for print content.
   */
  async openPrintableLessonPlan(): Promise<void> {
    await this.page.goto(
      '/courses/allthelessonplans/units/1/lessons/4?emulate_print_media',
    );
    await expect(this.lessonOverview).toBeVisible({timeout: 30_000});
  }

  /**
   * Opens the App Lab level with content below the visualization.
   */
  async openBelowVisualizationLevel(): Promise<void> {
    await this.page.goto(
      '/courses/allthethingscourse/units/1/lessons/18/levels/1?noautoplay=true',
      {waitUntil: 'domcontentloaded'},
    );
    await expect(this.visualizationResizeBar).toBeVisible({timeout: 30_000});
    await expect(this.belowVisualization).toBeAttached();
  }

  /**
   * Drags the visualization resize bar horizontally.
   *
   * @param delta - horizontal drag distance in pixels
   */
  async dragVisualizationResizeBar(delta: number): Promise<void> {
    const box = await this.visualizationResizeBar.boundingBox();
    if (!box) {
      throw new Error('visualization resize bar is not visible');
    }

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + delta, startY);
    await this.page.mouse.up();
    await expect(this.visualizationResizeBar).toBeVisible();
  }
}
