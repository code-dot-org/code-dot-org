import {expect, test} from '../../shared/fixtures';
import {
  expectHintBlockSpace,
  expectHintCount,
  hintPanel,
  viewNextHint,
} from '../../shared/hints';

/**
 * Contextual hints — two levels of allthethingscourse with different hint setups.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/contextual_hints.feature
 *
 * Anonymous; no authentication required.
 */

/** Lesson 6 level 2: has four authored hints; run produces contextual feedback. */
const LEVEL_WITH_AUTHORED_HINTS =
  '/courses/allthethingscourse/units/1/lessons/6/levels/2?noautoplay=true';
/** Lesson 3 level 6: no authored hints; run reveals one contextual hint. */
const LEVEL_WITHOUT_AUTHORED_HINTS =
  '/courses/allthethingscourse/units/1/lessons/3/levels/6?noautoplay=true';

test.describe('Contextual hints', () => {
  test('blocks render in contextual hints after an incorrect run', async ({
    page,
  }) => {
    await page.goto(LEVEL_WITH_AUTHORED_HINTS);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});

    // The instructions overlay (#overlay) covers the run button; dispatch the
    // click event directly (mirrors Cucumber's `I press "runButton"` step which
    // uses jQuery click and bypasses the overlay).
    await page.locator('#runButton').dispatchEvent('click');
    await page
      .locator('.uitest-topInstructions-inline-feedback')
      .waitFor({state: 'visible'});

    await expect(
      page.locator('.uitest-topInstructions-inline-feedback'),
    ).toContainText('Not quite. Try using a block you aren’t using yet.');
    await expectHintCount(page, 4);

    // View the next hint — a Blockly block-space renders inside the panel.
    await viewNextHint(page);
    await expect(hintPanel(page)).toContainText(
      'Try using a block like this to solve the puzzle.',
    );
    await expectHintBlockSpace(page);
  });

  test('level without authored hints shows one contextual hint after run', async ({
    page,
  }) => {
    await page.goto(LEVEL_WITHOUT_AUTHORED_HINTS);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});

    // Lightbulb is absent before running.
    await expect(page.locator('#lightbulb')).not.toBeAttached();

    await page.locator('#runButton').dispatchEvent('click');
    await page
      .locator('.uitest-topInstructions-inline-feedback')
      .waitFor({state: 'visible'});
    await page.locator('#resetButton').waitFor({state: 'visible'});

    // Exactly one contextual hint available after the failed run.
    await expectHintCount(page, 1);
  });
});
