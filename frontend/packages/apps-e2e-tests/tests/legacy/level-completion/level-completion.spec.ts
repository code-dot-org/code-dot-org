import {expect, test} from '../../shared/fixtures';
import {LEVEL_1_BOUNCE_BLOCKS} from '../activities/bounce/blocks';
import {Bounce} from '../activities/bounce/Bounce';
import {PlayLab} from '../activities/playlab/PlayLab';

test.describe('Level completion visual readiness', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_completion.feature
   * Scenario: (unnamed scenario) - bounce game
   */
  test('bounce game reaches completion visual checkpoint', async ({
    page,
    eyes,
  }) => {
    await eyes.open('bounce game');
    const bounce = new Bounce(page);
    await bounce.gotoLevel(1);
    await bounce.expectInitialVisualReady();
    await eyes.check('initial load');
    await bounce.loadBlocks(LEVEL_1_BOUNCE_BLOCKS);
    await eyes.check('block snap');
    await bounce.run();
    await bounce.holdKey('ArrowLeft');
    await expect(bounce.congratsMessage).toBeVisible({timeout: 30_000});
    await eyes.check('level completion');
    await bounce.releaseKey('ArrowLeft');
  });

  /**
   * Migration status: SKIPPED
   * Source: dashboard/test/ui/features/teacher_tools/level_completion.feature
   * Scenario: (unnamed scenario) - freeplay artist sharing
   */
  test.skip('freeplay artist sharing source scenario is skipped', async () => {
    test.skip(
      true,
      'Source Cucumber scenario is tagged @skip. It is a visual freeplay Artist sharing checkpoint.',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_completion.feature
   * Scenario: (unnamed scenario) - freeplay playlab sharing
   */
  test('freeplay playlab reaches completion visual checkpoint', async ({
    page,
    eyes,
  }) => {
    await eyes.open('freeplay playlab sharing');
    const playLab = new PlayLab(page);
    await playLab.gotoLevel(10);
    await playLab.expectInitialVisualReady();
    await eyes.check('initial load');
    await playLab.run();
    await expect(playLab.finishButton).toBeVisible({timeout: 30_000});
    await playLab.finish();
    await playLab.holdKey('ArrowLeft');
    await expect(playLab.congratsMessage).toBeVisible({timeout: 30_000});
    await eyes.check('freeplay playab level completion');
    await playLab.releaseKey('ArrowLeft');
  });
});
