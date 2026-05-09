import {expect, test} from '../../shared/fixtures';

/**
 * AI Chat Lab — model customization and chat interactions.
 *
 * Source: dashboard/test/ui/features/star_labs/aichat/chat.feature
 *
 * @no_mobile — all scenarios run as a levelbuilder.
 *
 * Background: navigate to lesson 47 level 2, dismiss the close-dialog,
 * dismiss the teacher panel.
 */

/** Lesson 47 / level 2 in allthethingscourse — the AI Chat Lab level. */
const AICHAT_URL = '/courses/allthethingscourse/units/1/lessons/47/levels/2';

/**
 * Dismiss the teacher panel by clicking the hide-handle chevron.
 * Mirrors `I dismiss the teacher panel` from steps.rb:
 *   click .teacher-panel > .hide-handle > .fa-chevron-right
 *   wait until .teacher-panel > .show-handle > .fa-chevron-left visible
 *
 * @param page - Playwright page with a teacher-panel present
 */
async function dismissTeacherPanel(
  page: import('@playwright/test').Page,
): Promise<void> {
  const hideHandle = page.locator(
    '.teacher-panel > .hide-handle > .fa-chevron-right',
  );
  if (await hideHandle.isVisible()) {
    await hideHandle.click();
    await page
      .locator('.teacher-panel > .show-handle > .fa-chevron-left')
      .waitFor({state: 'visible', timeout: 10_000});
  }
}

/**
 * Navigate to the AI Chat Lab level, dismiss the interstitial close-dialog,
 * and dismiss the teacher panel.
 *
 * @param page - Playwright page whose context holds the levelbuilder session
 */
async function gotoAichat(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.goto(AICHAT_URL);
  const closeDialog = page.locator('#ui-close-dialog');
  try {
    await closeDialog.waitFor({state: 'visible', timeout: 15_000});
    await closeDialog.click();
    await closeDialog.waitFor({state: 'hidden', timeout: 10_000});
  } catch {
    // no dialog within 15 s
  }
  await dismissTeacherPanel(page);
}

test.describe('AI Chat Lab — making a chat request', () => {
  /**
   * Source: chat.feature — "Making chat request gets appropriate response"
   * @no_mobile @as_levelbuilder
   *
   * Sends "Hello" and verifies bot reply color; then sends "Damn" and verifies
   * the content-moderation message appears (stubbed moderation flags this word
   * in Drone).
   */
  test(
    'chat request gets bot reply; blocked message shows moderation notice',
    {tag: '@no_mobile'},
    async ({levelbuilderPage}) => {
      await gotoAichat(levelbuilderPage);

      const textarea = levelbuilderPage.locator('#uitest-chat-textarea');
      const submit = levelbuilderPage.locator('#uitest-chat-submit');

      await textarea.waitFor({state: 'visible', timeout: 30_000});
      await textarea.fill('Hello');
      await expect(submit).toBeEnabled({timeout: 10_000});
      await submit.click();

      const botMsg = levelbuilderPage.locator(
        "[aria-label='AI bot chat message']",
      );
      await botMsg.waitFor({state: 'visible', timeout: 30_000});
      await expect(botMsg).toHaveCSS('background-color', 'rgb(235, 255, 254)');

      // Content moderation: "Damn" is flagged by the stub moderation service.
      await textarea.fill('Damn');
      await expect(submit).toBeEnabled({timeout: 10_000});
      await submit.click();
      await expect(
        levelbuilderPage.locator('.uitest-chat-message'),
      ).toContainText(
        'This message has been flagged by our content moderation policy.',
        {timeout: 30_000},
      );
    },
  );
});

test.describe('AI Chat Lab — editing system prompt', () => {
  /**
   * Source: chat.feature — "Editing system prompt produces success notification and saves"
   * @no_mobile @as_levelbuilder
   *
   * Types a new system prompt, saves, verifies success alert, reloads, and
   * confirms the value persists.
   */
  test(
    'system prompt saves and persists across reload',
    {tag: '@no_mobile'},
    async ({levelbuilderPage}) => {
      await gotoAichat(levelbuilderPage);

      const systemPrompt = levelbuilderPage.locator('#system-prompt');
      await systemPrompt.waitFor({state: 'visible', timeout: 30_000});
      await systemPrompt.fill('You are a safe chatbot');

      const updateBtn = levelbuilderPage.locator(
        '#uitest-update-customizations',
      );
      await expect(updateBtn).toBeEnabled({timeout: 10_000});
      await updateBtn.click();

      await expect(
        levelbuilderPage.locator('.uitest-aichat-chat-alert'),
      ).toContainText('System prompt has been updated', {timeout: 30_000});

      await levelbuilderPage.reload();
      await dismissTeacherPanel(levelbuilderPage);

      await systemPrompt.waitFor({state: 'visible', timeout: 30_000});
      await expect(systemPrompt).toHaveText('You are a safe chatbot');
    },
  );
});

test.describe('AI Chat Lab — publishing model', () => {
  /**
   * Source: chat.feature — "Publishing model enables published view and saves"
   * @no_mobile @as_levelbuilder
   *
   * Fills the model card info tab (bot name, description, …), saves, publishes,
   * verifies the view-mode toggle and presentation container appear, reloads
   * and confirms the published state is preserved.
   */
  test(
    'model card info saves and published view appears after publish',
    {tag: '@no_mobile'},
    async ({levelbuilderPage}) => {
      await gotoAichat(levelbuilderPage);

      await levelbuilderPage
        .locator('#modelCustomizationTabs-tab-modelCardInfo')
        .waitFor({state: 'visible', timeout: 30_000});
      await levelbuilderPage
        .locator('#modelCustomizationTabs-tab-modelCardInfo')
        .click();
      await levelbuilderPage
        .locator('#uitest-publish-notes-tab-content')
        .waitFor({state: 'visible', timeout: 10_000});

      await levelbuilderPage.locator('#botName').fill('Jeeves');
      await levelbuilderPage.locator('#description').fill('A description');
      await levelbuilderPage.locator('#intendedUse').fill('An intended use');
      await levelbuilderPage
        .locator('#limitationsAndWarnings')
        .fill('Some limitations and warnings');
      await levelbuilderPage
        .locator('#testingAndEvaluation')
        .fill('Some testing and evaluation that was done');
      await levelbuilderPage
        .locator('#exampleTopics')
        .fill('An example prompt or topic');

      const addExampleTopic = levelbuilderPage.locator(
        '#uitest-add-example-topic',
      );
      await expect(addExampleTopic).toBeEnabled({timeout: 10_000});
      await addExampleTopic.click();

      const saveNotes = levelbuilderPage.locator('#uitest-publish-notes-save');
      await expect(saveNotes).toBeEnabled({timeout: 10_000});
      await saveNotes.click();
      await expect(
        levelbuilderPage.locator('#uitest-aichat-save-alert'),
      ).toContainText('Saved', {timeout: 30_000});

      // Verify view-mode toggle and presentation view are not yet visible.
      await expect(
        levelbuilderPage.locator('#uitest-view-mode-toggle-container'),
      ).not.toBeVisible();
      await expect(
        levelbuilderPage.locator('#uitest-presentation-view-container'),
      ).not.toBeVisible();

      // Publish the model.
      await levelbuilderPage.locator('#uitest-publish-notes-publish').click();
      await expect(
        levelbuilderPage.locator('#uitest-view-mode-toggle-container'),
      ).toBeVisible({timeout: 15_000});
      await expect(
        levelbuilderPage.locator('#uitest-presentation-view-container'),
      ).toBeVisible({timeout: 15_000});
      await expect(
        levelbuilderPage.locator('#uitest-presentation-view-header'),
      ).toContainText('Jeeves', {timeout: 15_000});

      // Reload and switch to user view to confirm published state persists.
      await levelbuilderPage.reload();
      await dismissTeacherPanel(levelbuilderPage);
      const userViewBtn = levelbuilderPage.locator('#uitest-user-view-button');
      if (await userViewBtn.isVisible({timeout: 10_000}).catch(() => false)) {
        await userViewBtn.click();
      }
      await expect(
        levelbuilderPage.locator('#uitest-presentation-view-header'),
      ).toContainText('Jeeves', {timeout: 30_000});
    },
  );
});
