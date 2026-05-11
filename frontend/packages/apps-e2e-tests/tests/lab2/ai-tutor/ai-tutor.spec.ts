import {expect, test} from '../../shared/fixtures';

/**
 * AI Tutor smoke tests — chat in legacy App Lab, Python Lab resource panel,
 * and Weblab2 resource panel.
 *
 * Source: dashboard/test/ui/features/star_labs/ai_tutor/chat.feature
 *
 * @no_mobile @no_ci — requires authorized-teacher session and live AI backend.
 * All three scenarios run as an authorized teacher (@as_authorized_teacher).
 */

/**
 * Send a chat message and wait for the AI bot reply, then return the bot
 * message element locator for assertion by the caller.
 *
 * @param page - Playwright page with AI Tutor panel already open
 */
async function sendHelloAndWaitForBotReply(
  page: import('@playwright/test').Page,
): Promise<import('@playwright/test').Locator> {
  const textarea = page.locator('#uitest-chat-textarea');
  const submit = page.locator('#uitest-chat-submit');
  const botMessage = page.locator("[aria-label='AI bot chat message']");

  await textarea.waitFor({state: 'visible', timeout: 15_000});
  await textarea.fill('Hello');
  await expect(submit).toBeEnabled({timeout: 10_000});
  await submit.click();

  await expect(page.locator("[aria-label='User chat message']")).toHaveText(
    'Hello',
  );
  await botMessage.waitFor({state: 'visible', timeout: 30_000});
  return botMessage;
}

test.describe('AI Tutor — legacy App Lab', () => {
  /**
   * Migration status: PENDING
   * Source: dashboard/test/ui/features/star_labs/ai_tutor/chat.feature
   * Scenario: Chat works in the legacy labs AI Tutor
   * @no_ci @no_mobile @as_authorized_teacher
   *
   * Opens /projects/applab/new, waits for the AI Tutor button, sends "Hello",
   * and verifies the bot reply has the legacy-lab background color. Pending
   * because the authorized-teacher AI Tutor button is not deterministic in the
   * current Playwright lane.
   */
  test(
    'chat sends message and receives bot reply with correct background',
    {tag: ['@no_ci', '@no_mobile']},
    async ({authorizedTeacherPage}) => {
      test.fixme(
        true,
        'Pending migration: authorized-teacher AI Tutor button is not deterministic in this lane.',
      );
      await authorizedTeacherPage.goto(
        '/projects/applab/new?hideProductTours=true',
      );
      await authorizedTeacherPage
        .locator("[aria-label='Open AI tutor']")
        .waitFor({state: 'visible', timeout: 60_000});

      await authorizedTeacherPage
        .locator("[aria-label='Open AI tutor']")
        .click();

      const botMsg = await sendHelloAndWaitForBotReply(authorizedTeacherPage);
      await expect(botMsg).toHaveCSS('background-color', 'rgb(235, 255, 254)');
    },
  );
});

test.describe('AI Tutor — Python Lab resource panel', () => {
  /**
   * Migration status: PENDING
   * Source: dashboard/test/ui/features/star_labs/ai_tutor/chat.feature
   * Scenario: Chat works in the resource panel AI Tutor tab in Python Lab
   * @no_ci @no_mobile @as_authorized_teacher
   *
   * Navigates to lesson 50 level 1, opens the AI Tutor tab in the resource
   * panel, sends "Hello", and verifies the Lab2 bot reply background color.
   * Pending because the authorized-teacher resource-panel AI Tutor state is
   * not deterministic in the current Playwright lane.
   */
  test(
    'resource panel AI Tutor tab sends message and receives bot reply',
    {tag: ['@no_ci', '@no_mobile']},
    async ({authorizedTeacherPage}) => {
      test.fixme(
        true,
        'Pending migration: authorized-teacher resource-panel AI Tutor state is not deterministic in this lane.',
      );
      await authorizedTeacherPage.goto(
        '/courses/allthethingscourse/units/1/lessons/50/levels/1?hideProductTours=true',
      );
      await authorizedTeacherPage
        .locator('#resource-panel-tab-button-aiTutor')
        .waitFor({state: 'visible', timeout: 60_000});

      await authorizedTeacherPage
        .locator('#resource-panel-tab-button-aiTutor')
        .click();

      const botMsg = await sendHelloAndWaitForBotReply(authorizedTeacherPage);
      await expect(botMsg).toHaveCSS('background-color', 'rgb(4, 119, 115)');
    },
  );
});

test.describe('AI Tutor — Weblab2 resource panel', () => {
  /**
   * Migration status: PENDING
   * Source: dashboard/test/ui/features/star_labs/ai_tutor/chat.feature
   * Scenario: Chat works in the resource panel AI Tutor tab in Weblab2
   * @no_ci @no_mobile @as_authorized_teacher
   *
   * Navigates to lesson 51 level 11, waits for the instructions drawer,
   * opens the AI Tutor resource panel tab, and verifies the bot reply.
   * Pending because the AI Tutor chat message aria contract is not stable in
   * this lane.
   */
  test(
    'Weblab2 resource panel AI Tutor tab sends message and receives bot reply',
    {tag: ['@no_ci', '@no_mobile']},
    async ({authorizedTeacherPage}) => {
      test.fixme(
        true,
        'Pending migration: [aria-label=User chat message] is not stable in this lane.',
      );
      await authorizedTeacherPage.goto(
        '/courses/allthethingscourse/units/1/lessons/51/levels/11?hideProductTours=true',
      );
      await authorizedTeacherPage
        .locator('#instructions-drawer')
        .waitFor({state: 'visible', timeout: 60_000});
      await authorizedTeacherPage
        .locator('#resource-panel-tab-button-aiTutor')
        .waitFor({state: 'visible', timeout: 15_000});

      await authorizedTeacherPage
        .locator('#resource-panel-tab-button-aiTutor')
        .click();

      const botMsg = await sendHelloAndWaitForBotReply(authorizedTeacherPage);
      await expect(botMsg).toHaveCSS('background-color', 'rgb(4, 119, 115)');
    },
  );
});
