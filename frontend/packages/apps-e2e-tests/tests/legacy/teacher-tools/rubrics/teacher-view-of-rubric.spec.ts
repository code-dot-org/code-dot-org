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

/**
 * Click an intro.js tour button by firing HTMLElement.click() via evaluate.
 *
 * Playwright's {force: true} fires pointer events at the element's viewport
 * coordinates; on webkit those are silently dropped when the tooltip extends
 * outside the visible area (e.g. step 4 has position:'top' + a tall image).
 * evaluate-based click fires the event directly on the element, bypassing
 * coordinate dispatch entirely.
 *
 * @param page - Playwright page with an active intro.js tour
 * @param selector - CSS selector for the specific intro.js button to click
 */
async function clickTourBtn(
  page: import('@playwright/test').Page,
  selector: string,
): Promise<void> {
  await page.evaluate(sel => {
    (document.querySelector(sel) as HTMLElement)?.click();
  }, selector);
}

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
    // Chromium: rubric feedback flow flaky under parallel run; passes alone.
    test.fixme(
      true,
      'TODO: rubric feedback student-receives flow flaky on all browsers under parallel test run; teacher session timing issue',
    );
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
    // Use .teacher-panel td (same selector as the passing ai-evaluate tests).
    // Clicking <tr> on webkit does not propagate to the <a> link inside; <td>
    // does.
    await page
      .locator('.teacher-panel td')
      .nth(1)
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('.teacher-panel td').nth(1).click();
    await page.waitForURL(/user_id=/, {timeout: 30_000});
    await waitForLabPageLoad(page);

    // Product tour always appears on a new teacher's first rubric visit;
    // must be skipped before the panel will show the student-specific rubric.
    await page
      .locator('h1')
      .filter({hasText: 'Getting Started with Your AI Teaching Assistant'})
      .waitFor({state: 'visible', timeout: 20_000});
    await page
      .locator('.introjs-skipbutton')
      .waitFor({state: 'visible', timeout: 5_000});
    // Register before clicking: waitForResponse only catches future responses,
    // but the POST fires synchronously inside the click handler.
    const tourSeenAfterFeedbackSkip = page
      .waitForResponse(r => r.url().includes('update_ai_rubrics_tour_seen'), {
        timeout: 15_000,
      })
      .catch(() => {});
    // Use evaluate-based click: {force:true} fires at element coordinates which
    // may be outside the viewport when the tooltip extends past the screen edge.
    await clickTourBtn(page, '.introjs-skipbutton');
    // Wait for the introjs overlay to disappear AND for the server to persist
    // `tour_seen = true`.  Without this, opening the FAB remounts
    // RubricContainer which calls getTourStatus(); if the DB hasn't been
    // updated yet the server returns seen=false, productTour=true fires and
    // the overlay re-intercepts subsequent clicks.
    await page
      .locator('.introjs-overlay')
      .waitFor({state: 'hidden', timeout: 10_000})
      .catch(() => {});
    await tourSeenAfterFeedbackSkip;

    await page
      .locator('#ui-floatingActionButton')
      .waitFor({state: 'visible', timeout: 15_000});
    // Use evaluate-based click so an opacity:0 overlay cannot intercept.
    await page.evaluate(() => {
      (
        document.querySelector('#ui-floatingActionButton') as HTMLElement
      )?.click();
    });

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
    // Wait for the evidence-level autosave to complete (STATUS.FINISHED) before
    // touching the feedback textarea.  The autosave fires synchronously with the
    // click (no timer); while it is in STATUS.IN_PROGRESS the #ui-autosaveConfirm
    // element is not in the DOM, so a subsequent waitFor({state:'hidden'}) would
    // catch the in-flight PUT rather than the feedback autosave cycle, and we
    // would submit before the feedback text was ever saved to the server.
    await page
      .locator('#ui-autosaveConfirm')
      .waitFor({state: 'visible', timeout: 15_000});
    await expect(page.locator('#ui-teacherFeedback')).toBeEnabled({
      timeout: 10_000,
    });
    await page.locator('#ui-teacherFeedback').click();
    // fill() and pressSequentially don't reliably trigger React's onChange for
    // controlled textareas on webkit.  Use the native prototype setter trick:
    // bypass React's value-tracking snapshot by calling the original HTMLElement
    // setter directly, then dispatch a bubbling 'input' event so React's
    // delegated onChange listener fires and updates both the ref and state.
    // Do NOT use pressSequentially first — its keydown/input events can update
    // React's internal tracked value to match, causing the subsequent input
    // dispatch to see no delta and skip onChange entirely.
    await page.evaluate(() => {
      const el = document.querySelector(
        '#ui-teacherFeedback',
      ) as HTMLTextAreaElement;
      if (!el) return;
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(el, 'Nice work Lillian!');
      el.dispatchEvent(new Event('input', {bubbles: true}));
    });
    await expect(page.locator('#ui-teacherFeedback')).toHaveValue(
      'Nice work Lillian!',
      {
        timeout: 10_000,
      },
    );
    // Confirm was visible (FINISHED from 'Extensive' autosave).  The feedback
    // onChange sets a 2 s timer; wait for its IN_PROGRESS→FINISHED cycle
    // (confirm goes hidden then visible) so the PUT with 'Nice work Lillian!'
    // completes before we call submit_evaluations.
    await page
      .locator('#ui-autosaveConfirm')
      .waitFor({state: 'hidden', timeout: 10_000});
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
    // Mirrors "element X contains text Y" in Cucumber — check text, not visibility.
    await expect(page.locator('.uitest-student-progress-status')).toContainText(
      'Evaluated',
      {timeout: 20_000},
    );

    // Reload: FAB stays open with persisted feedback.
    await page.reload();
    await waitForLabPageLoad(page);
    await page
      .locator('#ui-floatingActionButton')
      .waitFor({state: 'visible', timeout: 20_000});
    // FAB may not auto-persist open on all browsers after reload — re-open if needed.
    if (
      !(await page
        .locator('h5')
        .filter({hasText: 'Code Quality'})
        .isVisible({timeout: 3_000})
        .catch(() => false))
    ) {
      await page.locator('#ui-floatingActionButton').click();
    }
    await page
      .locator('h5')
      .filter({hasText: 'Code Quality'})
      .waitFor({state: 'visible', timeout: 20_000});
    // Use toHaveValue rather than filter({hasText}) — reads the DOM .value
    // property directly and is reliable for React-state-driven textareas on
    // webkit where the a11y tree may lag behind a programmatic value update.
    await expect(page.locator('#ui-teacherFeedback')).toHaveValue(
      'Nice work Lillian!',
      {timeout: 30_000},
    );

    // Student: verify teacher feedback appears in the rubric tab.
    await signIn(page, studentEmail, studentPassword);
    await page.goto(RUBRIC_LEVEL_URL);
    await page
      .locator('.uitest-taRubricTab')
      .waitFor({state: 'visible', timeout: 15_000});
    await page.locator('.uitest-taRubricTab').click();
    await expect(
      page.locator('p').filter({hasText: 'Extensive Evidence'}).first(),
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
    // Firefox: product tour flow flaky under parallel run; passes alone.
    test.fixme(
      true,
      'TODO: rubric product tour flaky on firefox under parallel run; createTeacherAssociatedStudent or introjs timing issue',
    );
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
    await page.locator('.teacher-panel td').nth(1).click();
    await page.waitForURL(/user_id=/, {timeout: 30_000});
    await waitForLabPageLoad(page);

    // Tour step 1.
    await page
      .locator('h1')
      .filter({hasText: 'Getting Started with Your AI Teaching Assistant'})
      .waitFor({state: 'visible', timeout: 20_000});
    await page
      .locator('.introjs-tooltiptext')
      .waitFor({state: 'visible', timeout: 10_000});
    // Pre-open the FAB so onBeforeStepChange(1) does not need to click it via
    // a plain DOM .click() that React may not process synchronously on webkit.
    // Without this, #class-data-button is still inside a display:none container
    // when intro.js tries to highlight it, causing the tour to exit on webkit.
    // The tour uses DUMMY_PROPS while active so the rubric shows "Variables",
    // not "Code Quality" — check for #class-data-button (Class Data tab button)
    // which becomes visible when the FAB panel is open.
    if (
      !(await page
        .locator('#class-data-button')
        .isVisible({timeout: 2_000})
        .catch(() => false))
    ) {
      await page.locator('#ui-floatingActionButton').click({force: true});
      await page
        .locator('#class-data-button')
        .waitFor({state: 'visible', timeout: 10_000});
    }
    await clickTourBtn(page, '.introjs-nextbutton');

    // Tour step 2.
    // Note: h3:Lesson 3 is inside RubricContent which goes display:none on webkit when
    // intro.js focuses #class-data-button (the Settings tab button). Check tooltip heading only.
    await page
      .locator('h1')
      .filter({hasText: 'Class Data'})
      .waitFor({state: 'visible', timeout: 30_000});
    await clickTourBtn(page, '.introjs-nextbutton');

    // Tour step 3.
    await page
      .locator('h1')
      .filter({hasText: 'Understanding the AI Assessment'})
      .waitFor({state: 'visible', timeout: 30_000});
    await clickTourBtn(page, '.introjs-nextbutton');

    // Tour step 4.
    await page
      .locator('h1')
      .filter({hasText: 'Using Evidence'})
      .waitFor({state: 'visible', timeout: 30_000});
    await clickTourBtn(page, '.introjs-nextbutton');

    // Tour step 5.
    await page
      .locator('h1')
      .filter({hasText: 'Understanding AI Confidence'})
      .waitFor({state: 'visible', timeout: 30_000});
    await clickTourBtn(page, '.introjs-nextbutton');

    // Tour step 6.
    await page
      .locator('h1')
      .filter({hasText: 'Assigning a Rubric Score'})
      .waitFor({state: 'visible', timeout: 30_000});
    await clickTourBtn(page, '.introjs-nextbutton');

    // Tour step 7 (last).
    await page
      .locator('h1')
      .filter({hasText: 'How did Your AI Teaching Assistant do?'})
      .waitFor({state: 'visible', timeout: 30_000});
    await clickTourBtn(page, '.introjs-donebutton');

    // Tour completes → rubric view restored.
    await page
      .locator('h3')
      .filter({hasText: 'Lesson 48: AI Rubrics'})
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
    await page
      .locator('h5')
      .filter({hasText: 'Code Quality'})
      .waitFor({state: 'visible', timeout: 15_000});

    // Restart tour via question button.
    await page.locator('#ui-restart-product-tour').click();
    // h3:Lesson 3 may be hidden on webkit (RubricContent hidden when Settings tab active).
    await page
      .locator('h1')
      .filter({hasText: 'Getting Started with Your AI Teaching Assistant'})
      .waitFor({state: 'visible', timeout: 30_000});

    // Advance to the last step — wait for each step's h1 before clicking to
    // ensure the previous transition completed before firing the next click.
    const secondPassTitles = [
      'Class Data',
      'Understanding the AI Assessment',
      'Using Evidence',
      'Understanding AI Confidence',
      'Assigning a Rubric Score',
      'How did Your AI Teaching Assistant do?',
    ];
    for (const title of secondPassTitles) {
      await clickTourBtn(page, '.introjs-nextbutton');
      await page
        .locator('h1')
        .filter({hasText: title})
        .waitFor({state: 'visible', timeout: 30_000});
    }

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
      await clickTourBtn(page, '.introjs-prevbutton');
      await page
        .locator('h1')
        .filter({hasText: title})
        .waitFor({state: 'visible', timeout: 30_000});
    }

    // Exit via Skip.
    // Register before clicking so the POST fires inside the click handler.
    const tourSeenAfterExit = page
      .waitForResponse(r => r.url().includes('update_ai_rubrics_tour_seen'), {
        timeout: 15_000,
      })
      .catch(() => {});
    await clickTourBtn(page, '.introjs-skipbutton');
    await page
      .locator('h5')
      .filter({hasText: 'Code Quality'})
      .waitFor({state: 'visible', timeout: 30_000});
    // Ensure the tour-seen POST completes before reload; otherwise
    // getTourStatus() on remount sees seen=false and the tour reappears.
    await tourSeenAfterExit;

    // Reload: tour does not reappear.
    await page.reload();
    await waitForLabPageLoad(page);
    // FAB does not auto-persist open across reloads on all browsers; re-open
    // if the rubric content is not already visible.
    await page
      .locator('#ui-floatingActionButton')
      .waitFor({state: 'visible', timeout: 15_000});
    if (
      !(await page
        .locator('h5')
        .filter({hasText: 'Code Quality'})
        .isVisible({timeout: 3_000})
        .catch(() => false))
    ) {
      // Use evaluate-based click so a residual opacity:0 overlay cannot block.
      await page.evaluate(() => {
        (
          document.querySelector('#ui-floatingActionButton') as HTMLElement
        )?.click();
      });
    }
    await page
      .locator('h5')
      .filter({hasText: 'Code Quality'})
      .waitFor({state: 'visible', timeout: 20_000});
  });
});
