import {expect, test} from '@playwright/test';

import {JigsawLab} from './JigsawLab';

test.describe('Jigsaw — level 1', () => {
  let jigsaw: JigsawLab;

  test.beforeEach(async ({page}) => {
    jigsaw = new JigsawLab(page);
    await jigsaw.gotoLevel(1);
  });

  test('level renders the blank jigsaw image', async () => {
    await expect(
      jigsaw.page.locator('img[src*="jigsaw/blank.png"]'),
    ).toBeVisible();
  });

  test.fixme(
    'block cannot be deleted or dragged outside the workspace',
    async () => {
      // Porting "Can't delete blocks or lose them outside the workspace":
      // requires dragging jigsaw_2A to each edge and verifying it stays in
      // the workspace. Complex viewport-relative coordinate math; deferred.
    },
  );

  test('solving puzzle completes level 1', async () => {
    await jigsaw.moveToGhost('jigsaw_2A');
    await expect(jigsaw.congratsMessage).toBeVisible();
    await expect(jigsaw.congratsMessage).toContainText(
      'You completed Puzzle 1',
    );
  });
});

test.describe('Jigsaw — level 2', () => {
  let jigsaw: JigsawLab;

  test.beforeEach(async ({page}) => {
    jigsaw = new JigsawLab(page);
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
