import {test} from '@playwright/test';

import {BlockLayout} from './BlockLayout';
import {
  AUTO_POSITIONED_FLAPPY_WITH_EXTRA_NEWLINES_XML,
  AUTO_POSITIONED_FLAPPY_XML,
  MANUALLY_POSITIONED_PLAYLAB_XML,
} from './blocks';

test.describe('Block auto-layout', () => {
  let blockLayout: BlockLayout;

  test.beforeEach(async ({page}) => {
    blockLayout = new BlockLayout(page);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/blocklayout.feature
   * Scenario: Auto-placing malformed start blocks
   */
  test('auto-places malformed Flappy start blocks', async () => {
    await blockLayout.gotoFlappyLevel10();
    await blockLayout.clearWorkspace();
    await blockLayout.loadArrangedBlocksXml(
      AUTO_POSITIONED_FLAPPY_WITH_EXTRA_NEWLINES_XML,
    );

    await blockLayout.expectBlockNearOffset('whenClick', 16, 88);
    await blockLayout.expectBlockNearOffset('whenCollideGround', 16, 186);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/blocklayout.feature
   * Scenario: Auto-placing blocks
   */
  test('auto-places Flappy blocks', async () => {
    await blockLayout.gotoFlappyLevel10();
    await blockLayout.clearWorkspace();
    await blockLayout.loadArrangedBlocksXml(AUTO_POSITIONED_FLAPPY_XML);

    await blockLayout.expectBlockNearOffset('whenClick', 16, 88);
    await blockLayout.expectBlockNearOffset('whenCollideGround', 16, 186);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/blocklayout.feature
   * Scenario: Auto-placing blocks with XML positioning
   */
  test('auto-places PlayLab blocks with XML positions', async () => {
    await blockLayout.gotoPlayLabLevel4();
    await blockLayout.clearWorkspace();
    await blockLayout.loadArrangedBlocksXml(MANUALLY_POSITIONED_PLAYLAB_XML);

    await blockLayout.expectBlockNearOffset('whenUp', 20, 162);
    await blockLayout.expectBlockNearOffset('whenDown', 16, 233);
    await blockLayout.expectBlockNearOffset('whenLeft', 20, 22);
    await blockLayout.expectBlockNearOffset('whenRight', 16, 92);
  });
});
