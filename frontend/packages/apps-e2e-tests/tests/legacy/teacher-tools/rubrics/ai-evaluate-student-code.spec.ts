import {createTeacherAssociatedStudent, signIn} from '../../../shared/auth';
import {expect, test} from '../../../shared/fixtures';

/**
 * AI Evaluation of Student Code Against Rubrics.
 *
 * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_evaluate_student_code.feature
 *
 * AI evaluation is stubbed via /api/test/ai_proxy/assessment in test env.
 * All scenarios require an authorized teacher-associated student.
 *
 * @no_firefox — rubric AI features are only exercised on Chromium/WebKit.
 */

const RUBRIC_LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/48/levels/2';

/** Progress color constants for the level header bubble. */
const PROGRESS_COLORS = {
  not_tried: {bg: 'rgb(254, 254, 254)', border: 'rgb(198, 202, 205)'},
  perfect_assessment: {bg: 'rgb(140, 82, 186)', border: 'rgb(140, 82, 186)'},
} as const;

/**
 * @param page - Playwright page at a level in the lesson
 * @param levelNum - 1-based level number in the lesson header
 * @param progressType - expected progress state
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
 * Wait for the lab page to fully load.
 * Mirrors `I wait for the lab page to fully load` from steps.rb.
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
 * Ensure Droplet is in text mode.
 * Mirrors `I ensure droplet is in text mode` from droplet_steps.rb.
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
 * Append text at the end of the Droplet/Ace editor.
 * Mirrors `I append text to droplet "..."` from applab.rb.
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
 * Submit a Game Lab level: run → wait for submit button → navigate.
 * Mirrors `I submit this gamelab level` from steps.rb.
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

/**
 * Sign in as teacher_Aiden and navigate to student view for the rubric level.
 * Returns once the lab page and FAB are loaded.
 */
async function teacherViewStudentWork(
  page: import('@playwright/test').Page,
  teacherEmail: string,
  teacherPassword: string,
): Promise<void> {
  await signIn(page, teacherEmail, teacherPassword);
  await page.goto('/teacher_dashboard/home');
  await page
    .locator('#ui-test-section-list')
    .waitFor({state: 'visible', timeout: 20_000});
  await page.goto(RUBRIC_LEVEL_URL);
  await waitForLabPageLoad(page);
  await page
    .locator('.teacher-panel td')
    .nth(1)
    .waitFor({state: 'visible', timeout: 15_000});
  await Promise.all([
    page.waitForNavigation({timeout: 30_000}),
    page.locator('.teacher-panel td').nth(1).click(),
  ]);
  await waitForLabPageLoad(page);
  await page
    .locator('#ui-floatingActionButton')
    .waitFor({state: 'visible', timeout: 20_000});
}

/**
 * Dismiss the product tour intro if it appears.
 */
async function dismissProductTour(
  page: import('@playwright/test').Page,
): Promise<void> {
  const introHeading = page
    .locator('h1')
    .filter({hasText: 'Getting Started with Your AI Teaching Assistant'});
  if (await introHeading.isVisible({timeout: 5_000}).catch(() => false)) {
    const skipBtn = page.locator('.introjs-skipbutton');
    if (await skipBtn.isVisible({timeout: 3_000}).catch(() => false)) {
      await skipBtn.click();
    }
  }
  await page
    .locator('.congrats')
    .waitFor({state: 'hidden', timeout: 10_000})
    .catch(() => {});
}

test.describe(
  'AI Evaluation of Student Code',
  {tag: ['@no_mobile', '@no_firefox']},
  () => {
    /**
     * Source: ai_evaluate_student_code.feature
     * "Student code is evaluated by AI when student submits project"
     *
     * AI evaluation runs automatically on submission; teacher sees the
     * results in the rubric panel with the run button disabled.
     */
    test('AI evaluates code automatically on student submit', async ({
      page,
    }) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Aiden',
        });

      await page.goto('/home');
      await page.goto(RUBRIC_LEVEL_URL);
      await waitForLabPageLoad(page);
      await verifyHeaderProgress(page, 2, 'not_tried');

      await ensureTextMode(page);
      await appendTextToDroplet(
        page,
        '// the quick brown fox jumped over the lazy dog.\n',
      );
      await submitGamelabLevel(page);

      await teacherViewStudentWork(page, teacherEmail, teacherPassword);
      await dismissProductTour(page);
      await verifyHeaderProgress(page, 2, 'perfect_assessment');

      await page.locator('#ui-floatingActionButton').click();
      await page
        .locator('#uitest-rubric-content')
        .waitFor({state: 'visible', timeout: 15_000});
      await expect(page.locator('.uitest-run-ai-assessment')).toBeDisabled({
        timeout: 10_000,
      });
      await expect(
        page.locator('.uitest-rubric-tab-buttons .__react_component_tooltip'),
      ).toContainText('AI analysis already completed for this project.', {
        timeout: 15_000,
      });

      // Check second learning goal (Sprites) for AI evaluation result.
      await page
        .locator('#uitest-next-goal')
        .waitFor({state: 'visible', timeout: 10_000});
      await page.locator('#uitest-next-goal').click();
      await expect(page.locator('.uitest-learning-goal-title')).toContainText(
        'Sprites',
        {timeout: 10_000},
      );
      await expect(page.locator('.uitest-ai-assessment')).toContainText(
        'Aiden has achieved Extensive or Convincing Evidence',
        {timeout: 15_000},
      );
      await expect(
        page.locator('.uitest-student-progress-status'),
      ).toContainText('Ready to review');
    });

    /**
     * Source: ai_evaluate_student_code.feature
     * "Student code is evaluated by AI when teacher requests individual evaluation"
     *
     * Student only runs (does not submit); teacher manually triggers AI eval
     * for that student.
     */
    test('teacher triggers individual AI evaluation', async ({page}) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Aiden',
        });

      await page.goto('/home');
      await page.goto(RUBRIC_LEVEL_URL);
      await waitForLabPageLoad(page);
      await verifyHeaderProgress(page, 2, 'not_tried');

      await ensureTextMode(page);
      await appendTextToDroplet(
        page,
        '// the quick brown fox jumped over the lazy dog.\n',
      );
      // Only run, not submit.
      await page.locator('#runButton').click();
      await expect(page.locator('.project_updated_at')).toContainText('Saved', {
        timeout: 30_000,
      });

      await teacherViewStudentWork(page, teacherEmail, teacherPassword);
      await dismissProductTour(page);

      await page.locator('#ui-floatingActionButton').click();
      await page
        .locator('#uitest-rubric-content')
        .waitFor({state: 'visible', timeout: 15_000});
      await expect(page.locator('.uitest-run-ai-assessment')).toBeEnabled({
        timeout: 15_000,
      });
      await expect(
        page.locator('.uitest-student-progress-status'),
      ).toContainText('In progress');

      // Teacher runs AI evaluation.
      await page.locator('.uitest-run-ai-assessment').click();
      await expect(
        page.locator('.uitest-rubric-tab-buttons .__react_component_tooltip'),
      ).toContainText('AI analysis complete.', {timeout: 30_000});

      // Verify results.
      await page
        .locator('#uitest-next-goal')
        .waitFor({state: 'visible', timeout: 10_000});
      await page.locator('#uitest-next-goal').click();
      await expect(page.locator('.uitest-learning-goal-title')).toContainText(
        'Sprites',
        {timeout: 10_000},
      );
      await expect(page.locator('.uitest-ai-assessment')).toContainText(
        'Aiden has achieved Extensive or Convincing Evidence',
        {timeout: 15_000},
      );
      await expect(
        page.locator('.uitest-student-progress-status'),
      ).toContainText('Ready to review');
    });

    /**
     * Source: ai_evaluate_student_code.feature
     * "Student code is evaluated by AI when teacher requests evaluation for
     * entire class"
     *
     * Teacher triggers a class-wide AI evaluation from the Class Data tab.
     */
    test('teacher triggers class-wide AI evaluation', async ({page}) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Aiden',
        });

      await page.goto('/home');
      await page.goto(RUBRIC_LEVEL_URL);
      await waitForLabPageLoad(page);
      await verifyHeaderProgress(page, 2, 'not_tried');

      await ensureTextMode(page);
      await appendTextToDroplet(
        page,
        '// the quick brown fox jumped over the lazy dog.\n',
      );
      await page.locator('#runButton').click();
      await expect(page.locator('.project_updated_at')).toContainText('Saved', {
        timeout: 30_000,
      });

      await teacherViewStudentWork(page, teacherEmail, teacherPassword);
      await dismissProductTour(page);

      await page.locator('#ui-floatingActionButton').click();
      await page
        .locator('#uitest-rubric-content')
        .waitFor({state: 'visible', timeout: 15_000});
      await expect(page.locator('.uitest-run-ai-assessment')).toBeEnabled({
        timeout: 15_000,
      });
      await expect(
        page.locator('.uitest-student-progress-status'),
      ).toContainText('In progress');

      // Switch to Class Data tab.
      await page.locator('button').filter({hasText: 'Class Data'}).click();
      await page
        .locator('.uitest-run-ai-assessment-all')
        .waitFor({state: 'visible', timeout: 10_000});
      await expect(page.locator('#ui-teacherFeedback')).toBeEnabled({
        timeout: 10_000,
      });
      await expect(page.locator('.uitest-run-ai-assessment-all')).toBeEnabled({
        timeout: 10_000,
      });

      // Trigger class-wide evaluation.
      await page.locator('.uitest-run-ai-assessment-all').click();
      await page
        .locator('.uitest-eval-status-all-text')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.uitest-eval-status-all-text')).toContainText(
        'AI analysis complete.',
        {timeout: 30_000},
      );

      // Verify results in Student Rubric tab.
      await page
        .locator('button')
        .filter({hasText: 'Assess a Student'})
        .click();
      await page
        .locator('#uitest-next-goal')
        .waitFor({state: 'visible', timeout: 10_000});
      await page.locator('#uitest-next-goal').click();
      await expect(page.locator('.uitest-learning-goal-title')).toContainText(
        'Sprites',
        {timeout: 10_000},
      );
      await expect(page.locator('.uitest-ai-assessment')).toContainText(
        'Aiden has achieved Extensive or Convincing Evidence',
        {timeout: 15_000},
      );
      await expect(
        page.locator('.uitest-student-progress-status'),
      ).toContainText('Ready to review');
    });

    /**
     * Source: ai_evaluate_student_code.feature
     * "Alerts are shown when AI scores are available to review"
     *
     * After student submits, teacher sees a dismissible alert badge on the
     * FAB; dismissing it persists across page reloads.
     */
    test('dismissible alert appears when AI scores ready and persists dismissed', async ({
      page,
    }) => {
      const {teacherEmail, teacherPassword} =
        await createTeacherAssociatedStudent(page, {
          authorized: true,
          studentName: 'Aiden',
        });

      await page.goto('/home');
      await page.goto(RUBRIC_LEVEL_URL);
      await waitForLabPageLoad(page);
      await verifyHeaderProgress(page, 2, 'not_tried');

      await ensureTextMode(page);
      await appendTextToDroplet(
        page,
        '// the quick brown fox jumped over the lazy dog.\n',
      );
      await submitGamelabLevel(page);

      await teacherViewStudentWork(page, teacherEmail, teacherPassword);
      await dismissProductTour(page);

      await page
        .locator('.uitest-count-bubble')
        .waitFor({state: 'visible', timeout: 20_000});
      await expect(page.locator('.uitest-dismissible-alert')).toBeVisible();

      // Dismiss the alert.
      await page.locator('.uitest-dismissible-alert .fa-xmark').click();
      await page
        .locator('.uitest-dismiss-confirmed')
        .waitFor({state: 'visible', timeout: 10_000});
      await expect(page.locator('.uitest-dismissible-alert')).not.toBeVisible();

      // Alert stays dismissed after reload.
      await page.reload();
      await page
        .locator('#ui-floatingActionButton')
        .waitFor({state: 'visible', timeout: 20_000});
      await page
        .locator('.uitest-count-bubble')
        .waitFor({state: 'visible', timeout: 15_000});
      await expect(page.locator('.uitest-dismissible-alert')).not.toBeVisible();
    });
  },
);
