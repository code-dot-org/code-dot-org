import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';
import {LEVEL_1_BOUNCE_BLOCKS} from '../activities/bounce/blocks';
import {Bounce} from '../activities/bounce/Bounce';
import {
  expectCodeStudioHeaderReady,
  waitForStableVisualLayout,
} from '../shared/visualReadiness';

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

/**
 * Wait for Play Lab's first-run instructions pane to collapse after the
 * overlay is dismissed.
 */
async function expectPlayLabInitialVisualReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const instructions = document.querySelector('.csf-top-instructions');
      const workspace = document.querySelector('.blocklySvg');
      if (!instructions || !workspace) return false;

      const instructionsRect = instructions.getBoundingClientRect();
      const workspaceRect = workspace.getBoundingClientRect();

      return (
        instructionsRect.height > 80 &&
        instructionsRect.height < 130 &&
        workspaceRect.top > instructionsRect.bottom
      );
    },
    undefined,
    {timeout: 30_000},
  );
  await waitForStableVisualLayout(page, [
    '.csf-top-instructions',
    '.blocklySvg',
    '.blocklyBlockCanvas',
  ]);
}

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
    await page.goto(
      '/courses/playlab/units/1/lessons/1/levels/10?noautoplay=true',
    );
    await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
    await expectCodeStudioHeaderReady(page);
    await dismissInstructionsOverlay(page);
    await expectPlayLabInitialVisualReady(page);
    await eyes.check('initial load');
    await page.locator('#runButton').click();
    await expect(page.locator('#finishButton')).toBeVisible({timeout: 30_000});
    await page.locator('#finishButton').click();
    await page.keyboard.down('ArrowLeft');
    await expect(page.locator('.congrats')).toBeVisible({timeout: 30_000});
    await eyes.check('freeplay playab level completion');
    await page.keyboard.up('ArrowLeft');
  });
});
