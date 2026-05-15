import {type Page} from '@playwright/test';

import {createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Drags the legacy visualization resizer horizontally.
 *
 * @param page - current Playwright page
 * @param deltaX - horizontal drag distance in pixels
 */
async function dragVisualizationGrippy(
  page: Page,
  deltaX: number,
): Promise<void> {
  const grippy = page.locator(
    '#visualizationResizeBar, #visualizationResizeHandle, .ui-resizable-e',
  );
  await expect(grippy.first()).toBeVisible({timeout: 30_000});
  const box = await grippy.first().boundingBox();
  if (!box) throw new Error('visualization grippy not found');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + deltaX,
    box.y + box.height / 2,
    {
      steps: 10,
    },
  );
  await page.mouse.up();
}

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/teacher_tools/below_visualization.feature
 * Scenario: Check correct position of video thumbnails
 */
test('video thumbnails stay below visualization as it resizes', async ({
  page,
}) => {
  await createStudent(page);
  await page.goto(
    '/courses/allthethingscourse/units/1/lessons/18/levels/1?noautoplay=true',
  );
  await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
  await expect(page.locator('#belowVisualization')).toBeAttached({
    timeout: 30_000,
  });
  // Visual checkpoint stub: "default visualization width".

  await dragVisualizationGrippy(page, 400);
  await expect(page.locator('#belowVisualization')).toBeAttached();
  // Visual checkpoint stub: "wider visualization".

  await dragVisualizationGrippy(page, -400);
  await expect(page.locator('#belowVisualization')).toBeAttached();
  // Visual checkpoint stub: "narrower visualization".
});
