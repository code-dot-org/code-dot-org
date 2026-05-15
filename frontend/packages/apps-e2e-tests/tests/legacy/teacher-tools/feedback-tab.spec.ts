import {
  createAuthorizedTeacher,
  createSection,
  createStudent,
  joinSection,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {FeedbackTabPage} from './FeedbackTabPage';

/**
 * Feedback Tab Visibility — teacher and student views of the rubric
 * feedback tab on a level with a mini rubric.
 *
 * Source: dashboard/test/ui/features/teacher_tools/instructions/feedback_tab.feature
 *
 * Eyes checkpoints from feedback_tab_eyes.feature are represented by explicit
 * visual checkpoint comments; no screenshot assertion is taken in Playwright.
 */

/**
 * allthethingscourse lesson 38 level 1 — contained App Lab level with
 * a mini rubric.  Both Background and teacher-scenario assertions use this URL.
 */
const LEVEL_URL = '/courses/allthethingscourse/units/1/lessons/38/levels/1';

test.describe('Feedback Tab Visibility', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/feedback_tab_eyes.feature
   * Scenario: As student 'Feedback' tab is the 'Key Concept' tab if no feedback
   */
  test('eyes port: student feedback tab shows key concept when there is no feedback', async ({
    page,
  }) => {
    const teacher = await createAuthorizedTeacher(page);
    const {sectionCode} = await createSection(page);
    const student = await createStudent(page);
    await joinSection(page, sectionCode);

    const feedbackTab = new FeedbackTabPage(page);
    await feedbackTab.completeLevel();
    await feedbackTab.expectStudentKeyConceptFeedbackTab();
    // Visual checkpoint stub: student with no feedback tab.

    void teacher;
    void student;
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/feedback_tab.feature
   * Scenario: As student 'Feedback' tab is not visible if no feedback
   *
   * Student sees the Rubric tab on a mini-rubric level; the submit-feedback
   * and rubric-input controls are absent when no teacher feedback exists.
   */
  test('student sees Rubric tab but no submit feedback controls', async ({
    page,
  }) => {
    // Background: create authorized teacher + section + student, complete level.
    const teacher = await createAuthorizedTeacher(page);
    const {sectionCode} = await createSection(page);
    const student = await createStudent(page);
    await joinSection(page, sectionCode);

    await page.goto(`${LEVEL_URL}?noautoplay=true`);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#runButton').click();
    await page
      .locator('#finishButton')
      .waitFor({state: 'visible', timeout: 20_000});
    await page.locator('#finishButton').click();

    // Scenario assertions as student.
    await page.goto(LEVEL_URL);
    await page
      .locator('.uitest-feedback')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('.editor-column').first()).toContainText(
      'Rubric',
    );

    await page.locator('.uitest-feedback').click();
    await page
      .locator('.editor-column')
      .first()
      .waitFor({state: 'visible', timeout: 10_000});
    await expect(page.locator('.editor-column').first()).toContainText(
      'This is the key concept for this mini rubric.',
    );
    await expect(
      page.locator('#rubric-input-performanceLevel1'),
    ).not.toBeAttached();
    await expect(page.locator('#ui-test-submit-feedback')).not.toBeAttached();
    await expect(page.locator('#ui-test-feedback-time')).not.toBeAttached();

    // Suppress unused-variable lint.
    void teacher;
    void student;
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/feedback_tab.feature
   * Scenario: As teacher, when viewing a level with student work,
   *
   * Teacher confirms feedback tab absent on non-rubric levels → visible on
   * rubric level → selects student from panel → submits rubric feedback →
   * reloads and verifies persistence → student sees the feedback.
   */
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/instructions/feedback_tab_eyes.feature
   * Scenario: As teacher, when viewing a level with student work,
   *
   * The eyes scenario follows the same feedback flow with visual checkpoints.
   * The assertions below cover the functional readiness and state changes; the
   * screenshot checkpoints are stubbed as comments.
   */
  test('teacher can submit rubric feedback that student later sees', async ({
    page,
  }) => {
    // Background: create authorized teacher + section + student, complete level.
    const teacher = await createAuthorizedTeacher(page);
    const {sectionCode} = await createSection(page);
    const student = await createStudent(page);
    await joinSection(page, sectionCode);

    await page.goto(`${LEVEL_URL}?noautoplay=true`);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#runButton').click();
    await page
      .locator('#finishButton')
      .waitFor({state: 'visible', timeout: 20_000});
    await page.locator('#finishButton').click();

    // --- Teacher: check feedback tab presence on different level types ---
    await signIn(page, teacher.email, teacher.password);

    // Contained level without mini rubric — feedback tab absent.
    await page.goto('/courses/allthethingscourse/units/1/lessons/18/levels/15');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('.uitest-feedback')).not.toBeVisible();

    // Non-contained level without mini rubric — feedback tab absent.
    await page.goto('/courses/allthethingscourse/units/1/lessons/18/levels/7');
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('.uitest-feedback')).not.toBeVisible();

    // Rubric level — feedback tab visible.
    await page.goto(LEVEL_URL);
    await page
      .locator('.uitest-feedback')
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('.editor-column').first()).toContainText(
      'Rubric',
    );

    await page.locator('.uitest-feedback').click();
    await expect(page.locator('.editor-column').first()).toContainText(
      'This is the key concept for this mini rubric.',
    );
    // Visual checkpoint stub: teacher rubric feedback tab.
    await expect(
      page.locator('#rubric-input-performanceLevel1'),
    ).not.toBeAttached();
    await expect(page.locator('#ui-test-submit-feedback')).not.toBeAttached();
    await expect(page.locator('#ui-test-feedback-time')).not.toBeAttached();

    // Open teacher panel and select the student.
    const showHandle = page.locator('.show-handle .fa-chevron-left');
    if (await showHandle.isVisible({timeout: 5_000}).catch(() => false)) {
      await showHandle.click();
    }
    await page
      .locator('.student-table')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('#teacher-panel-container tr').nth(1).click();
    await page
      .locator('#ui-test-submit-feedback')
      .waitFor({state: 'visible', timeout: 30_000});

    await expect(page.locator('.editor-column').first()).toContainText(
      'This is the key concept for this mini rubric.',
    );
    // Visual checkpoint stub: teacher giving feedback tab load.
    await expect(page.locator('#ui-test-submit-feedback')).toContainText(
      'Save and share',
    );
    await expect(page.locator('#ui-test-feedback-time')).not.toBeAttached();

    // Select a rubric performance level and add written feedback.
    await page
      .locator('#rubric-input-performanceLevel1')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.evaluate(() => {
      (
        document.querySelector('#rubric-input-performanceLevel1') as HTMLElement
      )?.click();
    });
    await page
      .locator('#ui-test-feedback-input')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#ui-test-feedback-input').first().fill('Nice!');
    await page.evaluate(() => {
      (
        document.querySelector('#ui-test-submit-feedback') as HTMLElement
      )?.click();
    });

    await expect(page.locator('.editor-column').first()).toContainText(
      'Nice!',
      {
        timeout: 15_000,
      },
    );
    await expect(page.locator('#rubric-input-performanceLevel1')).toBeChecked({
      timeout: 10_000,
    });
    await expect(page.locator('#ui-test-feedback-time')).toContainText(
      'Updated by you',
      {timeout: 15_000},
    );
    await expect(page.locator('#ui-test-submit-feedback')).toContainText(
      'Update',
    );

    // Reload and verify feedback persists.
    await page.reload();
    await page
      .locator('.editor-column')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('.editor-column').first()).toContainText(
      'Nice!',
      {
        timeout: 15_000,
      },
    );
    await expect(page.locator('#rubric-input-performanceLevel1')).toBeChecked();
    await expect(page.locator('#ui-test-feedback-time')).toContainText(
      'Updated by you',
    );
    await expect(page.locator('#ui-test-submit-feedback')).toContainText(
      'Update',
    );
    // Visual checkpoint stub: teacher gave feedback.

    // --- Student: verify teacher feedback is now visible ---
    await signIn(page, student.email, student.password);
    await page.goto(LEVEL_URL);
    await page
      .locator('.uitest-feedback')
      .waitFor({state: 'visible', timeout: 30_000});

    await page.locator('.uitest-feedback').first().click();
    await expect(page.locator('.editor-column').first()).toContainText(
      'Nice!',
      {
        timeout: 15_000,
      },
    );
    await expect(page.locator('#rubric-input-performanceLevel1')).toBeChecked();
    await expect(page.locator('#ui-test-feedback-time')).toContainText(
      'Last updated',
    );
    // Visual checkpoint stub: student viewing teacher feedback.
  });
});
