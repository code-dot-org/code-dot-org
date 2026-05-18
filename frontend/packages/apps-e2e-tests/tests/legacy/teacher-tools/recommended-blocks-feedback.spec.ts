import {expect, test} from '../../shared/fixtures';

/**
 * Recommended/Required Blocks Feedback.
 *
 * Source: dashboard/test/ui/features/teacher_tools/feedback.feature
 * Scenario: "Solve without recommended blocks"
 *
 * Lesson 4 level 5 of allthethingscourse is a Bee level whose default
 * workspace has two `maze_moveForward` blocks — a valid solution but not
 * the recommended one.  Running it triggers the "But you could use a
 * different block" congrats message and the hint-request button.  Loading
 * the recommended bee blocks (a `controls_repeat` wrapping one
 * `maze_moveForward` + `bee_ifNectarAmount`) then running again produces
 * a clean "Congratulations!" with no hint button.
 */

/** Recommended bee blocks JSON for allthethingscourse lesson 4 level 5. */
const RECOMMENDED_BEE_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'controls_repeat',
            fields: {TIMES: 2},
            inputs: {
              DO: {
                block: {
                  type: 'maze_moveForward',
                  next: {
                    block: {
                      type: 'bee_ifNectarAmount',
                      fields: {
                        ARG1: '<field name="ARG1">nectarRemaining</field>',
                        OP: '<field name="OP">==</field>',
                        ARG2: '1',
                      },
                      inputs: {
                        DO: {block: {type: 'maze_nectar'}},
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};

test.describe(
  'Recommended/Required Blocks Feedback',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/feedback.feature
     * Scenario: Solve without recommended blocks
     * @as_student
     *
     * Run the Bee level with the default (suboptimal) two-moveforward blocks →
     * see the "But you could use a different block" feedback + hint request
     * button → click hint → see feedbackBlocks → try again with recommended
     * blocks → no hint button.
     */
    test('solving without recommended blocks shows hint then clears it', async ({
      page,
    }) => {
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/4/levels/5?noautoplay=true',
      );
      await page
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // Dismiss intro overlay (video/callout) that intercepts pointer events.
      const overlay = page.locator('#overlay');
      if (await overlay.isVisible()) {
        await page.evaluate(() =>
          (document.querySelector('#overlay') as HTMLElement)?.click(),
        );
        await overlay.waitFor({state: 'hidden', timeout: 10_000});
      }

      await page.locator('#runButton').click();
      await page
        .locator('.congrats')
        .waitFor({state: 'visible', timeout: 20_000});

      await expect(page.locator('.congrats')).toContainText(
        'But you could use a different block for stronger code.',
      );
      await expect(page.locator('#hint-request-button')).toBeVisible();

      await page.locator('#hint-request-button').click();
      await page
        .locator('#feedbackBlocks')
        .waitFor({state: 'visible', timeout: 10_000});
      await expect(page.locator('.congrats')).toContainText(
        'Try using one of the blocks below:',
      );
      await expect(page.locator('#feedbackBlocks')).toBeVisible();

      // Try again with the recommended bee blocks.
      await page.locator('#again-button').click();
      await page
        .locator('#resetButton')
        .waitFor({state: 'visible', timeout: 10_000});
      await page.locator('#resetButton').click();

      await page.evaluate(json => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blockly = (window as any).Blockly;
        blockly.serialization.workspaces.load(json, blockly.getMainWorkspace());
      }, RECOMMENDED_BEE_BLOCKS);

      await page.locator('#runButton').click();
      await page
        .locator('.congrats')
        .waitFor({state: 'visible', timeout: 20_000});

      await expect(page.locator('.congrats')).toContainText(
        'Congratulations! You completed Puzzle 5.',
      );
      await expect(page.locator('.congrats')).not.toContainText(
        'But you could use a different block',
      );
      await expect(page.locator('#hint-request-button')).not.toBeAttached();
    });
  },
);
