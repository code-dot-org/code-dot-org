import {expect, test} from '../../shared/fixtures';
import {expectPerfect, headerBubble} from '../../shared/progress';

/**
 * Swapped levels — lesson 29 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/level_swap.feature
 *
 * Verifies that:
 * - anonymous and progress-free students see the "active" (current) level,
 * - students who completed the old version see the swapped (old) level.
 */

const LESSON_29 = '/courses/allthethingscourse/units/1/lessons/29/levels';

/** Blocks JSON from blockly_initialization_blocks.rb "two move forward blocks". */
const TWO_MOVE_FORWARD_JSON =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"when_run","id":"topBlock","x":16,"y":16,"next":{"block":{"type":"maze_moveForward","id":"startBlock","next":{"block":{"type":"maze_moveForward","id":"moveForward"}}}}}]}}';

/** Blocks JSON from blockly_initialization_blocks.rb "winning artist blocks". */
const WINNING_ARTIST_JSON =
  '{"blocks":{"languageVersion":0,"blocks":[{"type":"when_run","x":32,"y":32,"next":{"block":{"type":"draw_move_by_constant","fields":{"DIR":"<field name=\\"DIR\\">moveForward</field>","VALUE":"100"},"next":{"block":{"type":"draw_turn_by_constant_dropdown","fields":{"DIR":"<field name=\\"DIR\\">turnRight</field>","VALUE":"<field name=\\"VALUE\\" config=\\"45,60,90,120,180\\">90</field>"},"next":{"block":{"type":"draw_move_by_constant","fields":{"DIR":"<field name=\\"DIR\\">moveForward</field>","VALUE":"100"}}}}}}}}]}}';

/**
 * Initializes the Blockly main workspace with the given JSON, presses run,
 * and waits for the congrats overlay — completing a maze/artist level.
 *
 * @param page - already at the target level with noautoplay=true
 * @param blocksJson - minified JSON passed to Blockly.serialization.workspaces.load
 */
async function completeBlocklyLevel(
  page: import('@playwright/test').Page,
  blocksJson: string,
): Promise<void> {
  await page.locator('#runButton').waitFor({state: 'visible', timeout: 30_000});
  // The instructions overlay (#overlay) must be dismissed by clicking it before
  // the run button becomes interactive.
  const overlay = page.locator('#overlay');
  if (await overlay.isVisible()) {
    await overlay.click();
    await overlay.waitFor({state: 'hidden', timeout: 10_000});
  }
  await page.evaluate((json: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Blockly.serialization.workspaces.load(
      JSON.parse(json),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Blockly.getMainWorkspace(),
    );
  }, blocksJson);
  await page.locator('#runButton').click();
  await page.locator('.congrats').waitFor({state: 'visible', timeout: 30_000});
}

// ─── Active version — anonymous and students without progress ─────────────────

test.describe('Level swap — active version', () => {
  test('signed-out user sees active version', async ({page}) => {
    // Source: level_swap.feature "Signed-out user sees active version"
    await page.goto(`${LESSON_29}/1`);
    await expect(page.locator('.instructions-markdown')).toContainText(
      'Guide me to the green evilness!',
      {timeout: 30_000},
    );

    await page.goto(`${LESSON_29}/4`);
    await expect(page.locator('.standalone-video h1')).toContainText(
      'Video: Artist Intro',
      {timeout: 30_000},
    );

    await page.goto(`${LESSON_29}/5`);
    await expect(page.locator('.instructions-markdown')).toContainText(
      'Now use a repeat block to make the cell a shell.',
      {timeout: 30_000},
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/level_swap.feature
   * Scenario: Signed-in student without progress sees active version
   */
  test('signed-in student without progress sees active version', async ({
    studentPage,
  }) => {
    await studentPage.goto(`${LESSON_29}/1`);
    await expect(studentPage.locator('.instructions-markdown')).toContainText(
      'Guide me to the green evilness!',
      {timeout: 30_000},
    );

    await studentPage.goto(`${LESSON_29}/4`);
    await expect(studentPage.locator('.standalone-video h1')).toContainText(
      'Video: Artist Intro',
      {timeout: 30_000},
    );

    await studentPage.goto(`${LESSON_29}/5`);
    await expect(studentPage.locator('.instructions-markdown')).toContainText(
      'Now use a repeat block to make the cell a shell.',
      {
        timeout: 30_000,
      },
    );
  });
});

// ─── Swapped version — student who completed the old version sees old text ────

test.describe('Level swap — student with progress', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/level_swap.feature
   * Scenario: Student with progress sees old version
   */
  test(
    'student with progress sees old version',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      // Complete level 1 (maze: two move forward blocks).
      await studentPage.goto(
        `${LESSON_29}/1?level_name=2-3+Maze+1&noautoplay=true`,
      );
      await completeBlocklyLevel(studentPage, TWO_MOVE_FORWARD_JSON);

      // Complete level 4 (artist: winning artist blocks).
      await studentPage.goto(
        `${LESSON_29}/4?level_name=2-3+Artist+1+new&noautoplay=true`,
      );
      await completeBlocklyLevel(studentPage, WINNING_ARTIST_JSON);

      // Complete level 5 (standalone video: click submit).
      await studentPage.goto(
        `${LESSON_29}/5?level_name=ramp_video_loopsArtist&noautoplay=true`,
      );
      await studentPage.locator('.submitButton').waitFor({state: 'visible'});
      await Promise.all([
        studentPage.waitForNavigation(),
        studentPage.locator('.submitButton').click(),
      ]);

      // Navigate to lesson 29 to verify progress bubbles.
      await studentPage.goto(`${LESSON_29}/5?noautoplay=true`);
      await expectPerfect(headerBubble(studentPage, 1));
      await expectPerfect(headerBubble(studentPage, 4));
      await expectPerfect(headerBubble(studentPage, 5));

      // With progress, each slot should redirect to the swapped (old) variant.
      await studentPage.goto(`${LESSON_29}/1`);
      await expect(studentPage.locator('.instructions-markdown')).toContainText(
        'Can you help me catch the naughty pig?',
        {
          timeout: 30_000,
        },
      );

      await studentPage.goto(`${LESSON_29}/4`);
      await expect(studentPage.locator('.instructions-markdown')).toContainText(
        "Hi, I'm an artist.",
        {timeout: 30_000},
      );

      await studentPage.goto(`${LESSON_29}/5`);
      await expect(studentPage.locator('.standalone-video h1')).toContainText(
        'Video: Artist Loops',
        {timeout: 30_000},
      );
    },
  );
});
