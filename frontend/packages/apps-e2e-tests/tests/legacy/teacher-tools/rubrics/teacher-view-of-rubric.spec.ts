import {
  createAuthorizedTeacher,
  createSection,
  createStudent,
  createTeacherAssociatedStudent,
  joinSection,
  signIn,
} from '../../../shared/auth';
import {expect, test} from '../../../shared/fixtures';

/**
 * Teacher View of Rubric — teacher feedback flow and product-tour navigation.
 *
 * Source: dashboard/test/ui/features/teacher_tools/rubrics/teacher_view_of_rubric.feature
 */

const RUBRIC_LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/48/levels/2';

/**
 * Wait for the level page to fully load.
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
 * Submit a Game Lab level: run → wait for submit → navigate.
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

test.describe('Teacher View of Rubric', {tag: '@no_mobile'}, () => {
  /**
   * Source: teacher_view_of_rubric.feature
   * "Teachers can give and send feedback on the rubric to students."
   *
   * Student submits code; teacher opens the rubric FAB, selects an evidence
   * level, writes feedback, submits; student sees the feedback.
   */
  test('teacher gives rubric feedback that student receives', async ({
    page,
  }) => {
    // Create teacher with authorized access and a section.
    const {email: teacherEmail, password: teacherPassword} =
      await createAuthorizedTeacher(page);
    await page.goto('/home');
    const {sectionCode} = await createSection(page);
    // Create student and join the section.
    const {email: studentEmail, password: studentPassword} =
      await createStudent(page, {name: 'Lillian'});
    await joinSection(page, sectionCode);

    // Student: navigate to rubric tab and submit work.
    await page.goto(RUBRIC_LEVEL_URL);
    await page
      .locator('.uitest-taRubricTab')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('.uitest-taRubricTab').click();
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 15_000});
    await submitGamelabLevel(page);

    // Teacher: navigate to student view and open rubric FAB.
    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/home');
    await page.goto(RUBRIC_LEVEL_URL);
    await page
      .locator('#ui-floatingActionButton')
      .waitFor({state: 'visible', timeout: 20_000});
    await page
      .locator('.student-table')
      .waitFor({state: 'visible', timeout: 15_000});
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('.student-table tr').nth(1).click(),
    ]);
    await waitForLabPageLoad(page);

    // Dismiss product-tour intro if it appears.
    const introHeading = page
      .locator('h1')
      .filter({hasText: 'Getting Started with Your AI Teaching Assistant'});
    if (await introHeading.isVisible({timeout: 5_000}).catch(() => false)) {
      const skipBtn = page.locator('.introjs-skipbutton');
      if (await skipBtn.isVisible({timeout: 3_000}).catch(() => false)) {
        await skipBtn.click();
      }
    }
    await page.waitForTimeout(2_000);

    await page
      .locator('#ui-floatingActionButton')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('#ui-floatingActionButton').click();

    // Select evidence level and write feedback.
    await page
      .locator('h5')
      .filter({hasText: 'Code Quality'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page
      .locator('button')
      .filter({hasText: 'Extensive'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('button').filter({hasText: 'Extensive'}).click();
    await expect(page.locator('#ui-teacherFeedback')).toBeEnabled({
      timeout: 10_000,
    });
    await page.locator('#ui-teacherFeedback').click();
    await page.locator('#ui-teacherFeedback').fill('Nice work Lillian!');
    await expect(
      page.locator('textarea').filter({hasText: 'Nice work Lillian!'}),
    ).toBeVisible({timeout: 10_000});
    await page
      .locator('#ui-autosaveConfirm')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('#ui-submitFeedbackButton').click();
    await page
      .locator('#ui-feedback-submitted-timestamp')
      .waitFor({state: 'visible', timeout: 15_000});
    await expect(
      page.locator('p').filter({hasText: 'Feedback submitted at'}),
    ).toBeVisible();
    await expect(
      page
        .locator('.uitest-student-progress-status')
        .filter({hasText: 'Evaluated'}),
    ).toBeVisible();

    // Reload: FAB stays open with persisted feedback.
    await page.reload();
    await page
      .locator('h5')
      .filter({hasText: 'Code Quality'})
      .waitFor({state: 'visible', timeout: 20_000});
    await expect(
      page.locator('textarea').filter({hasText: 'Nice work Lillian!'}),
    ).toBeVisible();

    // Student: verify teacher feedback appears in the rubric tab.
    await signIn(page, studentEmail, studentPassword);
    await page.goto(RUBRIC_LEVEL_URL);
    await page
      .locator('.uitest-taRubricTab')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('.uitest-taRubricTab').click();
    await expect(
      page.locator('p').filter({hasText: 'Extensive Evidence'}),
    ).toBeVisible({timeout: 15_000});
    await page.locator('h6').filter({hasText: 'Code Quality'}).click();
    await expect(
      page.locator('textarea').filter({hasText: 'Nice work Lillian!'}),
    ).toBeVisible({timeout: 10_000});
  });

  /**
   * Source: teacher_view_of_rubric.feature
   * "Teacher views rubric product tour"
   *
   * Teacher navigates through all 7 product-tour steps, uses Back, restarts
   * via the question button, and exits.  After completing and reloading, the
   * tour does not reappear.
   */
  test('teacher views rubric product tour', async ({page}) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {
        authorized: true,
        studentName: 'Aiden',
      });

    await signIn(page, teacherEmail, teacherPassword);
    await page.goto('/home');
    await page
      .locator('#ui-test-section-list')
      .waitFor({state: 'visible', timeout: 20_000});
    await page.goto(RUBRIC_LEVEL_URL);
    await waitForLabPageLoad(page);

    // Click the first student row to view their work.
    await page
      .locator('.teacher-panel td')
      .nth(1)
      .waitFor({state: 'visible', timeout: 15_000});
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('.teacher-panel td').nth(1).click(),
    ]);
    await waitForLabPageLoad(page);

    // Tour step 1.
    await page
      .locator('h1')
      .filter({hasText: 'Getting Started with Your AI Teaching Assistant'})
      .waitFor({state: 'visible', timeout: 20_000});
    await page
      .locator('.introjs-tooltiptext')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('.introjs-button').filter({hasText: 'Next Tip'}).click();

    // Tour step 2.
    await page
      .locator('h3')
      .filter({hasText: 'Lesson 3: Data Structures'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page
      .locator('h1')
      .filter({hasText: 'Class Data'})
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('.introjs-button').filter({hasText: 'Next Tip'}).click();

    // Tour step 3.
    await page
      .locator('h1')
      .filter({hasText: 'Understanding the AI Assessment'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('.introjs-button').filter({hasText: 'Next Tip'}).click();

    // Tour step 4.
    await page
      .locator('h1')
      .filter({hasText: 'Using Evidence'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('.introjs-button').filter({hasText: 'Next Tip'}).click();

    // Tour step 5.
    await page
      .locator('h1')
      .filter({hasText: 'Understanding AI Confidence'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('.introjs-button').filter({hasText: 'Next Tip'}).click();

    // Tour step 6.
    await page
      .locator('h1')
      .filter({hasText: 'Assigning a Rubric Score'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('.introjs-button').filter({hasText: 'Next Tip'}).click();

    // Tour step 7 (last).
    await page
      .locator('h1')
      .filter({hasText: 'How did Your AI Teaching Assistant do?'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('.introjs-button').filter({hasText: 'Done'}).click();

    // Tour completes → rubric view restored.
    await page
      .locator('h3')
      .filter({hasText: 'Lesson 48: AI Rubrics'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page
      .locator('h5')
      .filter({hasText: 'Code Quality'})
      .waitFor({state: 'visible', timeout: 10_000});

    // Restart tour via question button.
    await page.locator('#ui-restart-product-tour').click();
    await page
      .locator('h3')
      .filter({hasText: 'Lesson 3: Data Structures'})
      .waitFor({state: 'visible', timeout: 15_000});
    await page
      .locator('h1')
      .filter({hasText: 'Getting Started with Your AI Teaching Assistant'})
      .waitFor({state: 'visible', timeout: 10_000});

    // Advance to the last step.
    for (let i = 0; i < 6; i++) {
      await page
        .locator('.introjs-button')
        .filter({hasText: 'Next Tip'})
        .click();
    }
    await page
      .locator('h1')
      .filter({hasText: 'How did Your AI Teaching Assistant do?'})
      .waitFor({state: 'visible', timeout: 15_000});

    // Navigate back through all steps using Back.
    const stepTitles = [
      'Assigning a Rubric Score',
      'Understanding AI Confidence',
      'Using Evidence',
      'Understanding the AI Assessment',
      'Class Data',
      'Getting Started with Your AI Teaching Assistant',
    ];
    for (const title of stepTitles) {
      await page.locator('.introjs-button').filter({hasText: 'Back'}).click();
      await page
        .locator('h1')
        .filter({hasText: title})
        .waitFor({state: 'visible', timeout: 15_000});
    }

    // Exit via Skip.
    const skipButton = page.locator('.introjs-skipbutton');
    if (await skipButton.isVisible({timeout: 3_000}).catch(() => false)) {
      await skipButton.click();
    }
    await page
      .locator('h5')
      .filter({hasText: 'Code Quality'})
      .waitFor({state: 'visible', timeout: 15_000});

    // Reload: tour does not reappear.
    await page.reload();
    await waitForLabPageLoad(page);
    await page
      .locator('h5')
      .filter({hasText: 'Code Quality'})
      .waitFor({state: 'visible', timeout: 20_000});
  });
});
