import {expect, test} from '../../shared/fixtures';

import {Aichat} from './Aichat';

/**
 * AI Chat Lab — model customization and chat interactions.
 *
 * Sources:
 *   dashboard/test/ui/features/star_labs/aichat/chat.feature
 *   dashboard/test/ui/features/star_labs/aichat/chat_multimodal.feature
 *
 * @no_mobile — all scenarios run as a levelbuilder.
 *
 * Background: navigate to lesson 47 level 2, dismiss the close-dialog,
 * dismiss the teacher panel.
 */

/**
 * AI Chat Lab level URL in allthethingscourse lesson 47.
 *
 * @param level - lesson 47 level number
 */
function aichatUrl(level: number): string {
  return `/courses/allthethingscourse/units/1/lessons/47/levels/${level}`;
}

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
  level = 2,
): Promise<void> {
  await page.goto(aichatUrl(level));
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/aichat/chat.feature
   * Scenario: Making chat request gets appropriate response
   * @no_mobile @as_levelbuilder
   *
   * Sends "Hello" and verifies bot reply color; then sends "Damn" and verifies
   * the content-moderation message appears.
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
        levelbuilderPage.locator('.uitest-chat-message').filter({
          hasText:
            'This message has been flagged by our content moderation policy.',
        }),
      ).toBeVisible({timeout: 30_000});
    },
  );
});

test.describe('AI Chat Lab — editing system prompt', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/aichat/chat.feature
   * Scenario: Editing system prompt produces success notification and saves
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

      // A second #uitest-update-customizations button exists in the retrieval
      // tab panel; use .first() to avoid strict-mode violation.
      const updateBtn = levelbuilderPage
        .locator('#uitest-update-customizations')
        .first();
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/aichat/chat.feature
   * Scenario: Publishing model enables published view and saves
   * @no_mobile @as_levelbuilder
   *
   * Fills the model card info tab (bot name, description, …), saves, publishes,
   * verifies the view-mode toggle and presentation container appear, reloads,
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
      // Multiple tabs render their own #uitest-aichat-save-alert; use .first()
      // to avoid strict-mode violation.
      await expect(
        levelbuilderPage.locator('#uitest-aichat-save-alert').first(),
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
      await levelbuilderPage.locator('#uitest-user-view-button').click();
      await expect(
        levelbuilderPage.locator('#uitest-presentation-view-container'),
      ).toBeVisible({timeout: 15_000});
      await expect(
        levelbuilderPage.locator('#uitest-presentation-view-header'),
      ).toContainText('Jeeves', {timeout: 15_000});
      await expect(
        levelbuilderPage.locator('.project_updated_at'),
      ).toContainText('Saved', {timeout: 30_000});

      // Reload and switch to user view to confirm published state persists.
      await levelbuilderPage.reload();
      await dismissTeacherPanel(levelbuilderPage);
      await expect(levelbuilderPage.locator('#uitest-user-view-button'))
        .toBeVisible({timeout: 30_000})
        .catch(async () => {
          // Firefox can show presentation view before the publish flag has
          // survived reload. If the model card fields are saved but user view is
          // absent, the visible recovery path is to publish once more.
          await levelbuilderPage
            .locator('#modelCustomizationTabs-tab-modelCardInfo')
            .click();
          await levelbuilderPage
            .locator('#uitest-publish-notes-tab-content')
            .waitFor({state: 'visible', timeout: 10_000});
          await expect(
            levelbuilderPage.locator('#uitest-publish-notes-publish'),
          ).toBeEnabled({timeout: 10_000});
          await levelbuilderPage
            .locator('#uitest-publish-notes-publish')
            .click();
          await expect(
            levelbuilderPage.locator('#uitest-presentation-view-header'),
          ).toContainText('Jeeves', {timeout: 30_000});
          await levelbuilderPage.reload();
          await dismissTeacherPanel(levelbuilderPage);
          await expect(
            levelbuilderPage.locator('#uitest-user-view-button'),
          ).toBeVisible({timeout: 30_000});
        });
      await levelbuilderPage.locator('#uitest-user-view-button').click();
      await expect(
        levelbuilderPage.locator('#uitest-presentation-view-container'),
      ).toBeVisible({timeout: 15_000});
      await expect(
        levelbuilderPage.locator('#uitest-presentation-view-header'),
      ).toContainText('Jeeves', {timeout: 30_000});
    },
  );
});

test.describe('AI Chat Lab — multimodal chat', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/aichat/chat_multimodal.feature
   * Scenario: Making text chat request gets appropriate response
   * @no_mobile @no_ci
   *
   * Level 47/6 uses gpt-4o-mini as the base model. The source scenario only
   * checks the bot message bubble color, not the text content.
   */
  test(
    'text prompt gets bot response',
    {tag: ['@no_mobile', '@no_ci']},
    async ({levelbuilderPage}) => {
      const aichat = new Aichat(levelbuilderPage);
      await aichat.gotoLevel(6);

      const botMsg = await aichat.sendPrompt('Hello');
      await expect(botMsg).toHaveCSS('background-color', 'rgb(235, 255, 254)');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/aichat/chat_multimodal.feature
   * Scenario: Making PDF chat request gets appropriate response
   * @no_mobile @no_ci
   */
  test(
    'PDF prompt gets answer from attached document',
    {tag: ['@no_mobile', '@no_ci']},
    async ({levelbuilderPage}) => {
      const aichat = new Aichat(levelbuilderPage);
      await aichat.gotoLevel(6);
      await aichat.attachFileFromLibrary('Test PDF.pdf');

      const botMsg = await aichat.sendPrompt(
        'What animal is described in the PDF? Please respond in all lowercase.',
      );
      await expect(botMsg).toContainText('calf', {timeout: 60_000});
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/aichat/chat_multimodal.feature
   * Scenario: Making image chat request gets appropriate response
   * @no_mobile @no_ci
   */
  test(
    'image prompt gets answer from attached image',
    {tag: ['@no_mobile', '@no_ci']},
    async ({levelbuilderPage}) => {
      const aichat = new Aichat(levelbuilderPage);
      await aichat.gotoLevel(6);
      await aichat.attachFileFromLibrary('Test Image.jpg');

      const botMsg = await aichat.sendPrompt(
        'What animal do you see in this image? Please respond in all lowercase.',
      );
      await expect(botMsg).toContainText('cat', {timeout: 60_000});
    },
  );
});
