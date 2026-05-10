import {expect, test} from '@playwright/test';

import {Jigsaw} from './Jigsaw';

test.describe('Jigsaw — level 1', () => {
  let jigsaw: Jigsaw;

  test.beforeEach(async ({page}) => {
    jigsaw = new Jigsaw(page);
    await jigsaw.gotoLevel(1);
  });

  test('level renders the blank jigsaw image', async () => {
    await expect(jigsaw.blankImage).toBeVisible();
  });

  /**
   * Source: jigsaw.feature "Can't delete blocks or lose them outside the workspace"
   * Moves jigsaw_2A to each edge via the Blockly JS API and verifies the block
   * remains in the workspace (not deleted, visible within view bounds).
   */
  test('block cannot be deleted or dragged outside the workspace', async () => {
    const startPos = await jigsaw.getBlockPosition('jigsaw_2A');

    await jigsaw.moveBlockToEdge('jigsaw_2A', 'right');
    expect(await jigsaw.isBlockVisibleInWorkspace('jigsaw_2A')).toBe(true);
    const rightPos = await jigsaw.getBlockPosition('jigsaw_2A');
    expect(`${rightPos.x},${rightPos.y}`).not.toBe(
      `${startPos.x},${startPos.y}`,
    );

    await jigsaw.moveBlockToEdge('jigsaw_2A', 'bottom');
    expect(await jigsaw.isBlockVisibleInWorkspace('jigsaw_2A')).toBe(true);

    await jigsaw.moveBlockToEdge('jigsaw_2A', 'left');
    expect(await jigsaw.isBlockVisibleInWorkspace('jigsaw_2A')).toBe(true);

    await jigsaw.moveBlockToEdge('jigsaw_2A', 'top');
    expect(await jigsaw.isBlockVisibleInWorkspace('jigsaw_2A')).toBe(true);
  });

  test('solving puzzle completes level 1', async () => {
    await jigsaw.moveToGhost('jigsaw_2A');
    await expect(jigsaw.congratsMessage).toBeVisible();
    await expect(jigsaw.congratsMessage).toContainText(
      'You completed Puzzle 1',
    );
  });
});

test.describe('Jigsaw — level 2', () => {
  let jigsaw: Jigsaw;

  test.beforeEach(async ({page}) => {
    jigsaw = new Jigsaw(page);
    await jigsaw.gotoLevel(2);
  });

  test('solving final puzzle completes the course', async () => {
    await jigsaw.connectBlocks('jigsaw_3B', 'jigsaw_3A');
    await expect(jigsaw.congratsMessage).toBeVisible();
    await expect(jigsaw.congratsMessage).toContainText(
      'You have completed the final puzzle.',
    );
  });
});
