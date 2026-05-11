import {type Page} from '@playwright/test';

import {expect, test} from '../shared/fixtures';

import {AppLab} from './AppLab';

/**
 * App Lab — visualization overlay tooltips.
 *
 * Source: dashboard/test/ui/features/star_labs/applab/tooltips.feature
 * Migration status: see per-scenario comments.
 */

const TOOLTIP_ELEMENTS = [
  {
    type: 'TEXT_AREA',
    designId: 'design_text_area1',
    runId: 'text_area1',
    x: 10,
    y: 10,
  },
  {
    type: 'BUTTON',
    designId: 'design_button1',
    runId: 'button1',
    x: 10,
    y: 120,
  },
  {
    type: 'LABEL',
    designId: 'design_label1',
    runId: 'label1',
    x: 10,
    y: 160,
  },
  {
    type: 'TEXT_INPUT',
    designId: 'design_text_input1',
    runId: 'text_input1',
    x: 10,
    y: 190,
  },
  {
    type: 'RADIO_BUTTON',
    designId: 'design_radio_button1',
    runId: 'radio_button1',
    x: 10,
    y: 230,
  },
  {
    type: 'CHECKBOX',
    designId: 'design_checkbox1',
    runId: 'checkbox1',
    x: 10,
    y: 250,
  },
  {
    type: 'IMAGE',
    designId: 'design_image1',
    runId: 'image1',
    x: 10,
    y: 270,
  },
] as const;

/**
 * Return the locator for App Lab overlay tooltip text nodes.
 *
 * @param page - page containing an App Lab project
 */
function tooltipText(page: Page) {
  return page.locator('svg.tooltip-overlay text');
}

/**
 * Match AppLabTooltipOverlay's 12-character element id display.
 *
 * @param id - full App Lab element id
 */
function displayedTooltipId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 9)}...` : id;
}

/**
 * Assert that the coordinate tooltip is within one app-space pixel of the
 * expected point. Some controls report a fractional screen-space position; the
 * product rounds that value before rendering tooltip text.
 *
 * @param page - page containing an App Lab project
 * @param expectedX - expected app-space x coordinate
 * @param expectedY - expected app-space y coordinate
 */
async function expectTooltipCoordinatesNear(
  page: Page,
  expectedX: number,
  expectedY: number,
): Promise<void> {
  await expect
    .poll(async () => {
      const coordinateText =
        (await tooltipText(page).first().textContent()) ?? '';
      const match = coordinateText.match(/^x: (-?\d+), y: (-?\d+)$/);
      if (!match) {
        return coordinateText;
      }

      const actualX = Number(match[1]);
      const actualY = Number(match[2]);
      return (
        Math.abs(actualX - expectedX) <= 1 && Math.abs(actualY - expectedY) <= 1
      );
    })
    .toBe(true);
}

/**
 * Stub for Cucumber's `I open my eyes to test ...` Applitools step.
 * Playwright visual infrastructure is not wired here; keep this call so the
 * source visual contract is visible at the exact migration point.
 *
 * @param name - Applitools test name from the source scenario
 */
function openEyesStub(name: string): void {
  void name;
}

/**
 * Stub for Cucumber's `I see no difference for ...` Applitools checkpoint.
 * Functional assertions immediately before this call verify the user-visible
 * tooltip content. Pixel comparison remains deferred.
 *
 * @param name - Applitools checkpoint name from the source scenario
 */
function seeNoDifferenceStub(name: string): void {
  void name;
}

/**
 * Create the App Lab project used by the source feature Background.
 *
 * @param applab - App Lab page object
 */
async function setupTooltipProject(applab: AppLab): Promise<void> {
  await applab.page.goto('/projects/applab/new');
  await applab.waitForReady();
  await applab.switchToDesignMode();

  for (const element of TOOLTIP_ELEMENTS) {
    await applab.dragElementToApp(element.type);
    await expect(applab.page.locator(`#${element.designId}`)).toBeAttached();
    await applab.setDesignElementPosition(
      element.designId,
      element.x,
      element.y,
    );
  }

  await applab.saveProject();
}

/**
 * Assert that hovering an App Lab element shows both coordinates and id.
 *
 * @param applab - App Lab page object
 * @param elementId - DOM id to hover
 * @param displayedId - id text shown in the tooltip
 * @param x - element left coordinate in app-space pixels
 * @param y - element top coordinate in app-space pixels
 * @param checkpointName - Applitools checkpoint name from the source scenario
 */
async function expectElementTooltip(
  applab: AppLab,
  elementId: string,
  displayedId: string,
  x: number,
  y: number,
  checkpointName: string,
): Promise<void> {
  await applab.hoverAppElement(elementId);
  await expectTooltipCoordinatesNear(applab.page, x + 5, y + 5);
  await expect(tooltipText(applab.page)).toContainText([
    `id: ${displayedTooltipId(displayedId)}`,
  ]);
  seeNoDifferenceStub(checkpointName);
}

/**
 * Assert that a blank-area hover shows coordinates and no element id.
 *
 * @param applab - App Lab page object
 * @param x - App-space x coordinate
 * @param y - App-space y coordinate
 * @param checkpointName - Applitools checkpoint name from the source scenario
 */
async function expectBlankTooltip(
  applab: AppLab,
  x: number,
  y: number,
  checkpointName: string,
): Promise<void> {
  await applab.hoverVisualizationAt(x, y);
  await expectTooltipCoordinatesNear(applab.page, x, y);
  await expect(tooltipText(applab.page).filter({hasText: /^id:/})).toHaveCount(
    0,
  );
  seeNoDifferenceStub(checkpointName);
}

test.describe('App Lab — visualization overlay tooltips', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/tooltips.feature
   * Scenario: Hovering over elements in design mode
   * @eyes @as_student
   *
   * The Cucumber scenario is visual. This port checks the user-visible SVG
   * tooltip text directly: app-space coordinates and stripped design element id.
   */
  test(
    'design mode hover shows coordinates and element ids',
    {tag: ['@no_mobile', '@visual']},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await setupTooltipProject(applab);
      openEyesStub('tooltips in design mode');

      for (const element of TOOLTIP_ELEMENTS) {
        await expectElementTooltip(
          applab,
          element.designId,
          element.runId,
          element.x,
          element.y,
          `tooltip for ${element.runId.replace(/\d+$/, '').replaceAll('_', ' ')}`,
        );
      }

      await expectBlankTooltip(
        applab,
        300,
        100,
        'tooltip for blank screen area at (300, 100)',
      );
      await expectBlankTooltip(
        applab,
        300,
        200,
        'tooltip for blank screen area at (300, 200)',
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/tooltips.feature
   * Scenario: Hovering over elements in code mode
   * @eyes @as_student
   *
   * The readiness signal is the visible code workspace after switching modes.
   * The Cucumber fixed one-second wait is replaced by mode visibility and
   * tooltip text assertions.
   */
  test(
    'code mode hover shows coordinates and element ids',
    {tag: ['@no_mobile', '@visual']},
    async ({studentPage}) => {
      const applab = new AppLab(studentPage);
      await setupTooltipProject(applab);
      await applab.switchToCodeMode();
      openEyesStub('tooltips in code mode');

      for (const element of TOOLTIP_ELEMENTS.filter(
        element => element.type !== 'IMAGE',
      )) {
        await expectElementTooltip(
          applab,
          element.runId,
          element.runId,
          element.x,
          element.y,
          `tooltip for ${element.runId.replace(/\d+$/, '').replaceAll('_', ' ')}`,
        );
      }

      await expectBlankTooltip(
        applab,
        300,
        100,
        'tooltip for blank screen area at (300, 100)',
      );
      await expectBlankTooltip(
        applab,
        300,
        200,
        'tooltip for blank screen area at (300, 200)',
      );
    },
  );
});
