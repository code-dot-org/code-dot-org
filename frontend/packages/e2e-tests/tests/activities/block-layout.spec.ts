import {expect, test} from '@playwright/test';

import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';

import {
  AUTO_POSITIONED_FLAPPY_WITH_EXTRA_NEWLINES_XML,
  AUTO_POSITIONED_FLAPPY_XML,
  MANUALLY_POSITIONED_PLAYLAB_XML,
} from './block-layout-blocks';

const OFFSET_TOLERANCE_PX = 3;

const FLAPPY_LEVEL = {lesson: 7, level: 2};
const PLAYLAB_LEVEL = {lesson: 5, level: 4};

const FLAPPY_BLOCK_OFFSETS = {
  whenClick: {x: 16, y: 88},
  whenCollideGround: {x: 16, y: 189},
};
const PLAYLAB_BLOCK_OFFSETS = {
  whenUp: {x: 20, y: 164},
  whenDown: {x: 16, y: 236},
  whenLeft: {x: 20, y: 20},
  whenRight: {x: 16, y: 92},
};

async function expectBlockNear(
  lab: LegacyBlocklyLab,
  blockId: string,
  expected: {x: number; y: number},
): Promise<void> {
  await expect(lab.blockLocator(blockId)).toBeAttached();
  const {x, y} = await lab.blockOffset(blockId);
  expect(Math.abs(x - expected.x)).toBeLessThanOrEqual(OFFSET_TOLERANCE_PX);
  expect(Math.abs(y - expected.y)).toBeLessThanOrEqual(OFFSET_TOLERANCE_PX);
}

test.describe('Block auto-layout', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/blocklayout.feature "Auto-placing malformed start blocks"
   */
  test('Auto-placing malformed start blocks', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel(FLAPPY_LEVEL);

    await lab.loadArrangedBlocksXml(
      AUTO_POSITIONED_FLAPPY_WITH_EXTRA_NEWLINES_XML,
    );

    await expectBlockNear(lab, 'whenClick', FLAPPY_BLOCK_OFFSETS.whenClick);
    await expectBlockNear(
      lab,
      'whenCollideGround',
      FLAPPY_BLOCK_OFFSETS.whenCollideGround,
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/blocklayout.feature "Auto-placing blocks"
   */
  test('Auto-placing blocks', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel(FLAPPY_LEVEL);

    await lab.loadArrangedBlocksXml(AUTO_POSITIONED_FLAPPY_XML);

    await expectBlockNear(lab, 'whenClick', FLAPPY_BLOCK_OFFSETS.whenClick);
    await expectBlockNear(
      lab,
      'whenCollideGround',
      FLAPPY_BLOCK_OFFSETS.whenCollideGround,
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/blocklayout.feature "Auto-placing blocks with XML positioning"
   */
  test('Auto-placing blocks with XML positioning', async ({page}) => {
    const lab = new LegacyBlocklyLab(page);
    await lab.gotoLevel(PLAYLAB_LEVEL);

    await lab.loadArrangedBlocksXml(MANUALLY_POSITIONED_PLAYLAB_XML);

    await expectBlockNear(lab, 'whenUp', PLAYLAB_BLOCK_OFFSETS.whenUp);
    await expectBlockNear(lab, 'whenDown', PLAYLAB_BLOCK_OFFSETS.whenDown);
    await expectBlockNear(lab, 'whenLeft', PLAYLAB_BLOCK_OFFSETS.whenLeft);
    await expectBlockNear(lab, 'whenRight', PLAYLAB_BLOCK_OFFSETS.whenRight);
  });
});
