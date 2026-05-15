import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';
import {LEVEL_1_BOUNCE_BLOCKS} from '../activities/bounce/blocks';
import {Bounce} from '../activities/bounce/Bounce';

/**
 * Dismisses the visible instructions overlay that blocks legacy lab controls.
 *
 * @param page - Playwright page on a legacy lab level
 */
async function dismissInstructionsOverlay(page: Page): Promise<void> {
  const overlay = page.locator('#overlay');
  if (await overlay.isVisible({timeout: 1_000}).catch(() => false)) {
    await overlay.evaluate(element => (element as HTMLElement).click());
    await overlay.waitFor({state: 'hidden', timeout: 10_000});
  }
}

test.describe('Level completion visual readiness', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_completion.feature
   * Scenario: (unnamed scenario) - bounce game
   */
  test('bounce game reaches completion visual checkpoint', async ({page}) => {
    const bounce = new Bounce(page);
    await bounce.gotoLevel(1);
    await expect(bounce.runButton).toBeVisible();
    // Visual checkpoint stub: "initial load".
    await bounce.loadBlocks(LEVEL_1_BOUNCE_BLOCKS);
    // Visual checkpoint stub: "block snap".
    await bounce.run();
    await bounce.holdKey('ArrowLeft');
    await expect(bounce.congratsMessage).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "level completion".
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
  }) => {
    await page.goto(
      '/courses/playlab/units/1/lessons/1/levels/10?noautoplay=true',
    );
    await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
    await dismissInstructionsOverlay(page);
    // Visual checkpoint stub: "initial load".
    await page.locator('#runButton').click();
    await expect(page.locator('#finishButton')).toBeVisible({timeout: 30_000});
    await page.locator('#finishButton').click();
    await page.keyboard.down('ArrowLeft');
    await expect(page.locator('.congrats')).toBeVisible({timeout: 30_000});
    // Visual checkpoint stub: "freeplay playlab level completion".
    await page.keyboard.up('ArrowLeft');
  });
});
