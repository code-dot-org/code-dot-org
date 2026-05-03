import {expect, test} from '@playwright/test';

import {HOC_BLOCKS_TO_CLEAR} from './blocks';
import {HocLevel} from './HocLevel';

test.describe('Clear Puzzle — HOC level 1', () => {
  let clear: HocLevel;

  test.beforeEach(async ({page}) => {
    clear = new HocLevel(page);
    await clear.gotoLevel(1);
    await expect(clear.runButton).toBeVisible();
    await expect(clear.resetButton).toBeHidden();
  });

  test('clearing after deleting a block restores the original workspace', async () => {
    await clear.disposeBlock('startBlock');
    await clear.clearPuzzle();
    await clear.confirmClear();

    await clear.expectBlockIsChildOf('startBlock', 'topBlock');
  });

  test('clearing after adding blocks removes the added blocks', async () => {
    await clear.loadBlocks(HOC_BLOCKS_TO_CLEAR);
    await clear.clearPuzzle();
    await clear.confirmClear();

    await expect(clear.blockLocator('moveForward')).not.toBeAttached();
    await expect(clear.blockLocator('turnRight')).not.toBeAttached();
  });
});
