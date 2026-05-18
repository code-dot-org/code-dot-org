import {type Page} from '@playwright/test';

import {
  createAuthorizedTeacher,
  createSectionWithCourse,
  createStudent,
  joinSection,
  signIn,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * AI Chat Lab — teacher viewing student chat history.
 *
 * Source: dashboard/test/ui/features/star_labs/aichat/view_student_chat_history.feature
 * Scenario: "Teacher views student chat history and interacts with student model"
 *
 * Setup (mirrors the Background block):
 *   - Authorized teacher creates a section with AI chat enabled on
 *     customizing-llms-2024 unit 1.
 *   - A student joins, sends chat messages (including a flagged one), and
 *     decreases the model temperature.
 *
 * Scenario:
 *   - Teacher signs back in, opens the teacher panel, selects the student,
 *     flags the profane message, provides thumbs-up feedback, and verifies
 *     the student's temperature customization is visible before testing the
 *     student model.
 */

/** AI Chat level URL — customizing-llms-2024 course, unit 1, lesson 2, level 9. */
const AICHAT_URL = '/courses/customizing-llms-2024/units/1/lessons/2/levels/9';

/**
 * Dismiss the `#ui-close-dialog` button produced by AccessibleDialog.
 *
 * For students: ChatWarningModal ("Remember to chat responsibly!") renders via
 * AccessibleDialog and fires from a useEffect once `isUserTeacher` resolves —
 * it may appear several seconds after navigation.  `waitFor({state:'visible'})`
 * is required; `isVisible({timeout})` returns false immediately when the element
 * is not yet attached to DOM.
 *
 * No-op if no dialog appears within 15 s.
 *
 * @param page - Playwright page with the AI Chat level loaded
 */
async function dismissCloseDialog(page: Page): Promise<void> {
  const closeDialog = page.locator('#ui-close-dialog');
  try {
    await closeDialog.waitFor({state: 'visible', timeout: 15_000});
    await closeDialog.click();
    await closeDialog.waitFor({state: 'hidden', timeout: 10_000});
  } catch {
    // no close dialog appeared within 15 s — proceed without dismissal
  }
}

/**
 * Collapse the teacher panel by clicking its hide-handle chevron.
 * No-op if the panel is already collapsed (hide-handle not visible).
 * Mirrors `I dismiss the teacher panel` from steps.rb.
 *
 * @param page - Playwright page with a teacher panel present
 */
async function dismissTeacherPanel(page: Page): Promise<void> {
  const hideHandle = page.locator(
    '.teacher-panel > .hide-handle > .fa-chevron-right',
  );
  if (await hideHandle.isVisible({timeout: 5_000}).catch(() => false)) {
    await hideHandle.click();
    await page
      .locator('.teacher-panel > .show-handle > .fa-chevron-left')
      .waitFor({state: 'visible', timeout: 10_000});
  }
}

const MODERATION_NOTICE =
  'This message has been flagged by our content moderation policy.';

/**
 * Selects the first student in the teacher panel and waits until the persisted
 * chat history visible to the teacher includes the moderated message.
 *
 * The readiness signals mirror the Cucumber path: student table visible, the
 * student-view loading overlay hidden, and the moderation notice visible in
 * chat history. If the first fetch races the student chat-event write, reopen
 * the teacher panel and select the student again to trigger another visible
 * load.
 *
 * @param page - Playwright page signed in as the teacher
 */
async function selectFirstStudentAndWaitForModeratedHistory(
  page: Page,
): Promise<void> {
  const showHandle = page.locator('.show-handle .fa-chevron-left');
  const studentTable = page.locator('.student-table');
  const moderationNotice = page
    .locator('.uitest-chat-message')
    .filter({hasText: MODERATION_NOTICE});

  for (let attempt = 0; attempt < 3; attempt++) {
    if (await showHandle.isVisible({timeout: 5_000}).catch(() => false)) {
      await showHandle.click();
    }
    await expect(studentTable).toBeVisible({timeout: 15_000});

    // Click first data row (tr index 0 = header, index 1 = first student).
    await page.locator('#teacher-panel-container tr').nth(1).click();
    await dismissTeacherPanel(page);

    await page
      .locator('.uitest-is-loading-overlay')
      .waitFor({state: 'visible', timeout: 15_000})
      .catch(() => {});
    await page
      .locator('.uitest-is-loading-overlay')
      .waitFor({state: 'hidden', timeout: 30_000});

    if (
      await moderationNotice.isVisible({timeout: 20_000}).catch(() => false)
    ) {
      return;
    }
  }

  await expect(moderationNotice).toBeVisible({timeout: 30_000});
}

test.describe(
  'AI Chat Lab — teacher views student chat history',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/star_labs/aichat/view_student_chat_history.feature
     * Scenario: Teacher views student chat history and interacts with student model
     *
     * 1. Authorized teacher creates section with AI chat enabled.
     * 2. Student joins section, sends "Hello" + "Damn", decreases temperature.
     * 3. Teacher signs in, opens teacher panel, selects student, flags
     *    the profane message, provides positive feedback.
     * 4. Teacher verifies student's temperature setting and tests the model.
     */
    test('teacher flags messages and tests student model', async ({page}) => {
      // --- Background: authorized teacher + AI-chat-enabled section ---
      const teacher = await createAuthorizedTeacher(page);
      const {sectionCode} = await createSectionWithCourse(
        page,
        'customizing-llms-2024',
        1,
        {aiChatEnabled: true},
      );

      // --- Background: student joins section and builds chat history ---
      await createStudent(page);
      await joinSection(page, sectionCode);

      await page.goto(AICHAT_URL);
      await dismissCloseDialog(page);

      const textarea = page.locator('#uitest-chat-textarea');
      const submit = page.locator('#uitest-chat-submit');

      await textarea.waitFor({state: 'visible', timeout: 30_000});
      await textarea.fill('Hello');
      await expect(submit).toBeEnabled({timeout: 10_000});
      await submit.click();

      // Verify bot reply color before sending the flagged message.
      const botMsg = page.locator("[aria-label='AI bot chat message']");
      await botMsg.waitFor({state: 'visible', timeout: 30_000});
      await expect(botMsg).toHaveCSS('background-color', 'rgb(235, 255, 254)');

      // "Damn" is flagged by the stub content moderation service in UI tests.
      await textarea.fill('Damn');
      await expect(submit).toBeEnabled({timeout: 10_000});
      await submit.click();
      // Multiple .uitest-chat-message elements exist (Hello reply + Damn bubble);
      // filter to the one containing the moderation notice.
      await expect(
        page.locator('.uitest-chat-message').filter({
          hasText: MODERATION_NOTICE,
        }),
      ).toBeVisible({timeout: 30_000});

      // Decrease temperature once (default → 0.7) and save.
      await page.locator("[aria-label='Decrease']").click();
      await expect(page.locator('#uitest-update-customizations')).toBeEnabled({
        timeout: 10_000,
      });
      await page.locator('#uitest-update-customizations').click();
      await expect(page.locator('.uitest-aichat-chat-alert')).toContainText(
        'Temperature has been updated to 0.7',
        {timeout: 30_000},
      );

      // --- Scenario: teacher reviews student chat history ---
      await signIn(page, teacher.email, teacher.password);

      await page.goto(AICHAT_URL);
      await dismissCloseDialog(page);

      await selectFirstStudentAndWaitForModeratedHistory(page);

      // Flag the student's first clean message at teacher level.
      // Multiple clean messages exist (student "Hello" + bot reply); target first.
      const flagBtn = page
        .locator('.uitest-clean-feedback-footer button[aria-label="flag"]')
        .first();
      await flagBtn.waitFor({state: 'visible', timeout: 30_000});
      await flagBtn.click();
      await expect(
        page
          .locator('.uitest-clean-feedback-footer button[aria-label="unflag"]')
          .first(),
      ).toBeVisible({timeout: 15_000});
      // The "Damn" message already carries the content moderation notice.
      await expect(
        page.locator('.uitest-chat-message').filter({
          hasText: MODERATION_NOTICE,
        }),
      ).toBeVisible();

      // Reveal the flagged message content and provide thumbs-up feedback.
      await page.locator("[aria-label='show message']").click();
      await expect(
        page.locator('.uitest-profane-feedback-footer'),
      ).toContainText('Was this content flagged correctly?', {timeout: 15_000});
      await page.mouse.move(0, 0);
      await page
        .locator('#show-hide-tooltip')
        .waitFor({state: 'hidden', timeout: 5_000})
        .catch(() => {});
      const thumbsUp = page.locator("[aria-label='thumbs up']");
      await expect(thumbsUp).toBeVisible({timeout: 15_000});
      await thumbsUp.click();
      await expect(
        page.locator('.uitest-profane-feedback-footer'),
      ).toContainText('This content was flagged correctly.', {timeout: 15_000});

      // Teacher sees student's saved temperature (0.7) and tests the model.
      await expect(page.locator('.uitest-temperature-container')).toContainText(
        '0.7',
      );
      await page
        .locator('button', {hasText: 'Test student model'})
        .last()
        .click();

      await textarea.fill('Hello');
      await expect(submit).toBeEnabled({timeout: 10_000});
      await submit.click();
      await expect(
        page.locator("[aria-label='AI bot chat message']").last(),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.locator("[aria-label='AI bot chat message']").last(),
      ).toHaveCSS('background-color', 'rgb(235, 255, 254)');
    });
  },
);
