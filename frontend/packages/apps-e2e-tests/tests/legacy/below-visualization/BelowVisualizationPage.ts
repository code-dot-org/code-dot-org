import {expect, type Locator, type Page} from '@playwright/test';

import {AppLab} from '../../applab/AppLab';

/**
 * Page object for `teacher_tools/below_visualization.feature`.
 * The scenario asserts that App Lab's video thumbnails stay below the
 * visualization while the visualization column is resized.
 */
export class BelowVisualizationPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** App Lab readiness and shared lab chrome helpers. */
  readonly appLab: AppLab;

  /** App Lab visualization column containing the visualization and videos. */
  readonly visualizationColumn: Locator;

  /** Legacy container that holds video thumbnails below the visualization. */
  readonly belowVisualization: Locator;

  /** Resize handle on the visualization column. */
  readonly resizeHandle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.appLab = new AppLab(page);
    this.visualizationColumn = page.locator('#visualizationColumn');
    this.belowVisualization = page.locator('#belowVisualization');
    this.resizeHandle = page
      .locator(
        '#visualizationResizeBar, #visualizationResizeHandle, .ui-resizable-e',
      )
      .first();
  }

  /**
   * Navigate to the video-thumbnail App Lab level and wait for visible,
   * user-facing readiness. The stable screenshot subject is the visualization
   * column, not the full page header or footer.
   */
  async gotoVideoThumbnailLevel(): Promise<void> {
    await this.page.goto(
      '/courses/allthethingscourse/units/1/lessons/18/levels/1?noautoplay=true',
    );
    await this.waitForReady();
  }

  /**
   * Wait until App Lab, the visualization column, and the thumbnail area are
   * visible and their boxes have stopped shifting.
   */
  async waitForReady(): Promise<void> {
    await this.appLab.waitForReady();
    await expect(this.visualizationColumn).toBeVisible({timeout: 30_000});
    await expect(this.belowVisualization).toBeAttached({timeout: 30_000});
    await this.waitForStableVisualLayout();
  }

  /**
   * Drag the visualization resizer horizontally and wait for the resized
   * visualization column to settle before taking a screenshot.
   *
   * @param deltaX - horizontal drag distance in pixels
   */
  async dragVisualizationGrippy(deltaX: number): Promise<void> {
    await expect(this.resizeHandle).toBeVisible({timeout: 30_000});
    const box = await this.resizeHandle.boundingBox();
    if (!box) throw new Error('visualization grippy not found');
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(
      box.x + box.width / 2 + deltaX,
      box.y + box.height / 2,
      {steps: 10},
    );
    await this.page.mouse.up();
    await this.waitForReady();
  }

  /**
   * Wait for the region that the test snapshots to stop moving.
   */
  async waitForStableVisualLayout(): Promise<void> {
    await this.page.waitForFunction(
      () =>
        new Promise<boolean>(resolve => {
          let previous = '';
          let stableFrames = 0;
          const signature = () =>
            ['#visualizationColumn', '#belowVisualization']
              .flatMap(selector =>
                Array.from(document.querySelectorAll(selector)),
              )
              .map(element => {
                const box = element.getBoundingClientRect();
                return `${Math.round(box.x)}:${Math.round(box.y)}:${Math.round(
                  box.width,
                )}:${Math.round(box.height)}`;
              })
              .join('|');

          const check = () => {
            const current = signature();
            stableFrames = current === previous ? stableFrames + 1 : 0;
            previous = current;
            if (stableFrames >= 5) {
              resolve(true);
            } else {
              requestAnimationFrame(check);
            }
          };
          requestAnimationFrame(check);
        }),
      undefined,
      {timeout: 15_000},
    );
  }
}
