import {expect, test} from '@playwright/test';

import {Jigsaw} from './Jigsaw';

test.describe('Visiting a jigsaw page', () => {
  let jigsaw: Jigsaw;

  test.beforeEach(async ({page}) => {
    jigsaw = new Jigsaw(page);
    await jigsaw.gotoLevel(1);
  });

  /** Migration status: COMPLETED  Source: dashboard/test/ui/features/star_labs/jigsaw.feature "Loading the first jigsaw level" */
  test('Loading the first jigsaw level', async () => {
    await expect(jigsaw.blankImage).toBeVisible();
  });

  /** Migration status: COMPLETED  Source: dashboard/test/ui/features/star_labs/jigsaw.feature "Can't delete blocks or lose them outside the workspace" */
  test("Can't delete blocks or lose them outside the workspace", async () => {
    expect(await jigsaw.countBlocksOfType('jigsaw_2A')).toBe(1);
    const startPos = await jigsaw.getBlockPosition('jigsaw_2A');

    await jigsaw.moveBlockToEdge('jigsaw_2A', 'right');
    expect(await jigsaw.isBlockPresent('jigsaw_2A')).toBe(true);
    const rightPos = await jigsaw.getBlockPosition('jigsaw_2A');
    expect(`${rightPos.x},${rightPos.y}`).not.toBe(
      `${startPos.x},${startPos.y}`,
    );
    expect(await jigsaw.isBlockVisibleInWorkspace('jigsaw_2A')).toBe(true);

    await jigsaw.moveBlockToEdge('jigsaw_2A', 'bottom');
    expect(await jigsaw.isBlockPresent('jigsaw_2A')).toBe(true);
    expect(await jigsaw.isBlockVisibleInWorkspace('jigsaw_2A')).toBe(true);

    await jigsaw.moveBlockToEdge('jigsaw_2A', 'left');
    expect(await jigsaw.isBlockPresent('jigsaw_2A')).toBe(true);
    expect(await jigsaw.isBlockVisibleInWorkspace('jigsaw_2A')).toBe(true);

    await jigsaw.moveBlockToEdge('jigsaw_2A', 'top');
    expect(await jigsaw.isBlockPresent('jigsaw_2A')).toBe(true);
    expect(await jigsaw.isBlockVisibleInWorkspace('jigsaw_2A')).toBe(true);
  });

  /** Migration status: COMPLETED  Source: dashboard/test/ui/features/star_labs/jigsaw.feature "Solving puzzle" */
  test('Solving puzzle', async () => {
    await jigsaw.moveToGhost('jigsaw_2A');
    await expect(jigsaw.congratsMessage).toBeVisible();
    await expect(jigsaw.congratsMessage).toContainText(
      'You completed Puzzle 1',
    );
  });
});
