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

/**
 * Stub the Drone moderation result for the "Damn" message so test-studio
 * records the same profane user-message state the Cucumber scenario expects.
 *
 * @param page - Playwright page that will send the chat message
 */
async function stubDamnModeration(page: Page): Promise<void> {
  let requestId = 91_001;
  const stubbedIds = new Set<number>();

  await page.route('**/aichat_request/start_chat_completion', async route => {
    const postData = route.request().postData();
    const payload = postData ? JSON.parse(postData) : {};
    if (payload.newMessage?.chatMessageText !== 'Damn') {
      await route.fallback();
      return;
    }

    const id = requestId++;
    stubbedIds.add(id);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        requestId: id,
        pollingIntervalMs: 1000,
        backoffRate: 1,
      }),
    });
  });

  await page.route('**/aichat_request/chat_request/*', async route => {
    const id = Number(route.request().url().split('/').pop());
    if (!stubbedIds.has(id)) {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        executionStatus: 1001,
        response: '',
      }),
    });
  });
}

/**
 * Persist a completed profane user message if the app-side logger has not
 * flushed it yet. Teacher history is backed by `/aichat_events/chat_history`,
 * not by the student's current Redux state.
 *
 * @param page - Playwright page still signed in as the student
 * @param aichatContext - Context captured from a prior app log request
 * @param requestId - Stubbed chat-completion request id
 */
async function logProfaneUserMessage(
  page: Page,
  aichatContext: Record<string, unknown>,
  requestId: number,
): Promise<void> {
  const result = await page.evaluate(
    async ({context, id}) => {
      const csrfToken =
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content') || '';
      const response = await fetch('/aichat_events/log_chat_event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          newChatEvent: {
            chatMessageText: 'Damn',
            role: 'user',
            status: 'profanity_violation',
            timestamp: Date.now(),
            requestId: id,
          },
          aichatContext: context,
        }),
      });

      return {ok: response.ok, status: response.status};
    },
    {context: aichatContext, id: requestId},
  );

  expect(result.ok, `log_chat_event returned ${result.status}`).toBe(true);
}

test.describe(
  'AI Chat Lab — teacher views student chat history',
  {tag: '@no_mobile'},
  () => {
    /**
     * Migration status: PENDING
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
      test.fixme(
        true,
        'Pending migration: deterministic profanity stubbing updates the student UI, but the profane event is not visible through teacher chat history.',
      );
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
      await stubDamnModeration(page);
      let latestAichatContext: Record<string, unknown> | undefined;
      let sawLoggedProfanity = false;
      await page.route('**/aichat_events/log_chat_event', async route => {
        const postData = route.request().postData();
        if (postData) {
          const payload = JSON.parse(postData);
          latestAichatContext = payload.aichatContext;
          sawLoggedProfanity =
            sawLoggedProfanity ||
            payload.newChatEvent?.status === 'profanity_violation';
        }
        await route.fallback();
      });

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

      // "Damn" is flagged by the stub content moderation service in Drone.
      await textarea.fill('Damn');
      await expect(submit).toBeEnabled({timeout: 10_000});
      await submit.click();
      // Multiple .uitest-chat-message elements exist (Hello reply + Damn bubble);
      // filter to the one containing the moderation notice.
      await expect(
        page.locator('.uitest-chat-message').filter({
          hasText:
            'This message has been flagged by our content moderation policy.',
        }),
      ).toBeVisible({timeout: 30_000});
      await expect
        .poll(() => latestAichatContext !== undefined, {
          timeout: 10_000,
          message: 'AI Chat context was captured from chat event logging',
        })
        .toBe(true);
      if (!sawLoggedProfanity && latestAichatContext) {
        await logProfaneUserMessage(page, latestAichatContext, 91_001);
      }

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

      // Teacher panel loads expanded by default on this level; wait for
      // the student table to confirm the panel is ready.  If for some reason
      // it loaded collapsed, expand it first.
      const showHandle = page.locator('.show-handle .fa-chevron-left');
      const studentTable = page.locator('.student-table');
      if (await showHandle.isVisible({timeout: 5_000}).catch(() => false)) {
        await showHandle.click();
      }
      await expect(studentTable).toBeVisible({timeout: 15_000});

      // Click first data row (tr index 0 = header, index 1 = first student).
      await page.locator('#teacher-panel-container tr').nth(1).click();

      // Collapse teacher panel; student view loads with a loading overlay.
      await dismissTeacherPanel(page);

      // Wait for loading overlay to clear (appears briefly after panel close).
      await page
        .locator('.uitest-is-loading-overlay')
        .waitFor({state: 'visible', timeout: 15_000})
        .catch(() => {});
      await page
        .locator('.uitest-is-loading-overlay')
        .waitFor({state: 'hidden', timeout: 30_000});

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
          hasText:
            'This message has been flagged by our content moderation policy.',
        }),
      ).toBeVisible();

      // Reveal the flagged message content and provide thumbs-up feedback.
      await page.locator("[aria-label='show message']").click();
      await expect(
        page.locator('.uitest-profane-feedback-footer'),
      ).toContainText('Was this content flagged correctly?', {timeout: 15_000});
      await page.locator("[aria-label='thumbs up']").click();
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
