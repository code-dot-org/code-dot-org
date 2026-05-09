import {
  addUserToExperiment,
  createTeacherAssociatedStudent,
} from '../../../shared/auth';
import {expect, test} from '../../../shared/fixtures';

/**
 * Student Completing a Rubric-Enabled Level — student submits work and
 * progress updates in the level header.
 *
 * Source: dashboard/test/ui/features/teacher_tools/rubrics/student_completes_rubric_level.feature
 *
 * The level used is allthethingscourse unit 1 lesson 48 level 2 (Game Lab,
 * rubric-enabled).
 */

const RUBRIC_LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/48/levels/2';

/** Progress color constants. */
const PROGRESS_COLORS = {
  not_tried: {bg: 'rgb(254, 254, 254)', border: 'rgb(198, 202, 205)'},
  perfect_assessment: {bg: 'rgb(140, 82, 186)', border: 'rgb(140, 82, 186)'},
} as const;

/**
 * Wait until the header progress bubble for levelNum matches the expected
 * progress state.  Mirrors `I verify progress in the header of the current
 * page is "X" for level N` from progress.rb.
 *
 * @param page - Playwright page at a level in the same lesson
 * @param levelNum - 1-based level number within the lesson
 * @param progressType - key into PROGRESS_COLORS
 */
async function verifyHeaderProgress(
  page: import('@playwright/test').Page,
  levelNum: number,
  progressType: keyof typeof PROGRESS_COLORS,
): Promise<void> {
  const bubble = page
    .locator('.header_level .react_stage a')
    .nth(levelNum - 1)
    .locator('.progress-bubble');
  const {bg, border} = PROGRESS_COLORS[progressType];
  await expect(async () => {
    const bgColor = await bubble.evaluate(
      el => getComputedStyle(el).backgroundColor,
    );
    const borderColor = await bubble.evaluate(
      el => getComputedStyle(el).borderTopColor,
    );
    expect(bgColor).toBe(bg);
    expect(borderColor).toBe(border);
  }).toPass({timeout: 30_000});
}

/**
 * Wait for the level page to be fully loaded: run button visible, header
 * user visible, instructions overlay dismissed.
 * Mirrors `I wait for the lab page to fully load` from steps.rb.
 *
 * @param page - Playwright page at a level
 */
async function waitForLabPageLoad(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.locator('#runButton').waitFor({state: 'visible', timeout: 30_000});
  await page
    .locator('.header_user')
    .waitFor({state: 'visible', timeout: 15_000});
  const overlay = page.locator('#overlay');
  if (await overlay.isVisible({timeout: 3_000}).catch(() => false)) {
    await page.evaluate(() =>
      (document.querySelector('#overlay') as HTMLElement)?.click(),
    );
    await overlay.waitFor({state: 'hidden', timeout: 10_000});
  }
}

/**
 * Ensure the Droplet editor is in text (Ace) mode.
 * Mirrors `I ensure droplet is in text mode` from droplet_steps.rb.
 *
 * @param page - Playwright page with a Droplet/Game Lab level loaded
 */
async function ensureTextMode(
  page: import('@playwright/test').Page,
): Promise<void> {
  const buttonText = await page.evaluate(
    () => document.querySelector('#show-code-header')?.textContent,
  );
  if (buttonText === 'Show Text') {
    await page.evaluate(() =>
      (document.querySelector('#show-code-header') as HTMLElement)?.click(),
    );
    await page
      .locator('.ace_editor')
      .waitFor({state: 'visible', timeout: 10_000});
  }
}

/**
 * Append text to the Ace editor inside Droplet.
 * Mirrors `I append text to droplet "..."` from applab.rb.
 *
 * @param page - Playwright page with the Droplet editor in text mode
 * @param text - text to append at the end of the current editor content
 */
async function appendTextToDroplet(
  page: import('@playwright/test').Page,
  text: string,
): Promise<void> {
  await page.evaluate(t => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = (window as any).__TestInterface?.getDroplet?.();
    if (d) {
      d.aceEditor.navigateFileEnd();
      d.aceEditor.textInput.focus();
      d.aceEditor.onTextInput(t);
    }
  }, text);
}

/**
 * Submit a Game Lab level: run → wait for submit button → click to navigate.
 * Mirrors `I submit this gamelab level` from steps.rb.
 *
 * @param page - Playwright page with a Game Lab assessment level loaded
 */
async function submitGamelabLevel(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.locator('#runButton').click();
  await page
    .locator('#submitButton')
    .waitFor({state: 'visible', timeout: 20_000});
  await Promise.all([
    page.waitForNavigation({timeout: 30_000}),
    page.locator('#submitButton').click(),
  ]);
}

test.describe('Student Completing Rubric Level', () => {
  /**
   * Source: student_completes_rubric_level.feature
   * "Student of verified teacher can complete rubric-enabled level"
   *
   * Student under an authorized teacher submits code; progress advances from
   * not_tried to perfect_assessment.
   */
  test('student of verified teacher can complete rubric-enabled level', async ({
    page,
  }) => {
    await createTeacherAssociatedStudent(page, {authorized: true});

    await page.goto(RUBRIC_LEVEL_URL);
    await waitForLabPageLoad(page);
    await verifyHeaderProgress(page, 2, 'not_tried');

    await ensureTextMode(page);
    await appendTextToDroplet(
      page,
      '// the quick brown fox jumped over the lazy dog.\n',
    );
    await submitGamelabLevel(page);

    // Re-navigate to verify progress persisted.
    await page.goto(RUBRIC_LEVEL_URL);
    await waitForLabPageLoad(page);
    await verifyHeaderProgress(page, 2, 'perfect_assessment');
  });

  /**
   * Source: student_completes_rubric_level.feature
   * "Student of unverified teacher can complete rubric-enabled level"
   *
   * Student enrolled in the "non-ai-rubrics" experiment (unverified teacher
   * path) also reaches perfect_assessment after submitting.
   */
  test('student in non-ai-rubrics experiment can complete rubric-enabled level', async ({
    page,
  }) => {
    await createTeacherAssociatedStudent(page);
    await addUserToExperiment(page, 'non-ai-rubrics');

    await page.goto(RUBRIC_LEVEL_URL);
    await waitForLabPageLoad(page);
    await verifyHeaderProgress(page, 2, 'not_tried');

    await ensureTextMode(page);
    await appendTextToDroplet(
      page,
      '// the quick brown fox jumped over the lazy dog.\n',
    );
    await submitGamelabLevel(page);

    await page.goto(RUBRIC_LEVEL_URL);
    await waitForLabPageLoad(page);
    await verifyHeaderProgress(page, 2, 'perfect_assessment');
  });
});
