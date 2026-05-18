import type {Page} from '@playwright/test';

import {addUserToExperiment, createTeacher} from '../../../shared/auth';
import {expect, test} from '../../../shared/fixtures';

/**
 * AI Differentiation Chat — teacher interacts with and disables the AI
 * differentiation FAB.
 *
 * Source: dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature
 *
 * AI diff chat responses are stubbed via ai_diff_bedrock_helper.rb in the
 * test environment.
 *
 * @chrome — both scenarios are tagged @chrome in the source feature file.
 */

function aiDiffThreadDynamicIgnoreRegions(page: Page) {
  return [
    page
      .getByRole('navigation', {name: 'AI differentiation chat threads'})
      .locator('li p'),
    page
      .getByRole('navigation', {name: 'AI differentiation chat threads'})
      .getByText('Notifications')
      .locator('xpath=..'),
  ];
}

async function expectAiDiffThreadsVisualReady(page: Page): Promise<void> {
  await expect(
    page.getByRole('heading', {name: 'Unit 1 - UI Test Artist'}),
  ).toBeVisible({timeout: 30_000});
  await expect(page.getByText('View page as:')).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole('button', {name: 'Teacher'})).toBeVisible({
    timeout: 30_000,
  });
  await page
    .locator('#ui-floatingActionButton')
    .waitFor({state: 'visible', timeout: 20_000});
  await page
    .getByRole('button', {name: 'Suggest prompts'})
    .waitFor({state: 'visible', timeout: 30_000});
  await expect(
    page.getByRole('navigation', {name: 'AI differentiation chat threads'}),
  ).toBeVisible({timeout: 30_000});
  await expect(page.locator('#uitest-chat-textarea')).toBeVisible({
    timeout: 30_000,
  });
}

test.describe(
  'AI Differentiation Chat',
  {tag: ['@no_mobile', '@chrome']},
  () => {
    test.skip(
      ({browserName}) => browserName !== 'chromium',
      'Source Cucumber feature is @chrome/@no_firefox: dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature',
    );

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature
     * Scenario: Teacher sees welcome screen for AI Differentiation
     */
    test('teacher sees welcome screen for AI Differentiation', async () => {
      test.skip(
        true,
        'Source Cucumber scenario is @skip/@eyes with disabled welcome-experience steps. Source: dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature Scenario: Teacher sees welcome screen for AI Differentiation',
      );
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature
     * Scenario: Teacher can disable AI chat feature
     *
     * Teacher enrolled in the ai-differentiation experiment can send a chat
     * message; toggling the AI teacher diff setting on /users/edit removes the
     * FAB from the teacher dashboard home.
     */
    test('teacher can disable AI chat feature', async ({page}) => {
      await createTeacher(page, {name: 'Stilgar'});
      await page.goto('/home');
      await addUserToExperiment(page, 'ai-differentiation');

      await page.goto('/teacher_dashboard/home');
      await page
        .locator('#teacher-home-header')
        .waitFor({state: 'visible', timeout: 30_000});
      await page
        .locator('#ui-floatingActionButton')
        .waitFor({state: 'visible', timeout: 20_000});

      // Wait for chat to be ready (welcome experience skipped per commented steps).
      await page
        .locator('button')
        .filter({hasText: 'Suggest prompts'})
        .waitFor({state: 'visible', timeout: 30_000});

      // Type and submit a chat message.
      await page.locator('#uitest-chat-textarea').click();
      await page
        .locator('#uitest-chat-textarea')
        .fill('How do I add a classroom section');
      await expect(
        page.locator('textarea').filter({
          hasText: 'How do I add a classroom section',
        }),
      ).toBeVisible();
      await page.locator('#uitest-chat-submit').click();
      await page
        .locator('p')
        .filter({hasText: 'Lorem ipsum'})
        .waitFor({state: 'visible', timeout: 30_000});

      // Disable the AI chat feature on the edit page.
      await page.goto('/users/edit');
      await page
        .locator('input[name="aiTeacherDiffToggle"]')
        .waitFor({state: 'visible', timeout: 15_000});
      await Promise.all([
        page.waitForResponse(
          response =>
            response
              .url()
              .includes('/api/v1/users/ai_differentiation_enabled') &&
            response.ok(),
        ),
        page.locator('input[name="aiTeacherDiffToggle"]').click(),
      ]);

      // FAB should be absent on the teacher dashboard home.
      await page.goto('/teacher_dashboard/home');
      await page
        .locator('#teacher-home-header')
        .waitFor({state: 'visible', timeout: 20_000});
      await expect(page.locator('#ui-floatingActionButton')).not.toBeAttached({
        timeout: 10_000,
      });
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature
     * Scenario: Teacher can type messages and leave feedback in AI Differentiation chat
     */
    test('teacher can type messages and leave feedback in AI Differentiation chat', async ({
      page,
    }) => {
      await createTeacher(page, {name: 'Stilgar'});
      await page.goto('/home');
      await addUserToExperiment(page, 'ai-differentiation');

      await page.goto('/courses/ui-test-artist/units/1');
      await page
        .locator('#ui-floatingActionButton')
        .waitFor({state: 'visible', timeout: 20_000});
      await page
        .getByRole('button', {name: 'Suggest prompts'})
        .waitFor({state: 'visible', timeout: 30_000});

      await page
        .locator('#uitest-chat-textarea')
        .fill('Which lessons have a project');
      await page.locator('#uitest-chat-submit').click();

      await expect(
        page.locator('[aria-label="User chat message"]'),
      ).toContainText('Which lessons have a project');
      await page
        .locator('p')
        .filter({hasText: 'Lorem ipsum'})
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      await page.getByRole('button', {name: 'Suggest prompts'}).click();
      await page.getByRole('button', {name: 'Create'}).click();
      await page.getByRole('button', {name: 'Write a lesson hook'}).click();

      const responses = page.locator('p').filter({hasText: 'Lorem ipsum'});
      await expect(async () =>
        expect(await responses.count()).toBeGreaterThanOrEqual(2),
      ).toPass({timeout: 30_000, intervals: [500, 1000, 2000]});

      await page
        .getByRole('button', {name: 'Give this message a thumbs up'})
        .nth(2)
        .click();
      await expect(page.locator('i.fa-regular.fa-thumbs-up').nth(2)).toHaveCSS(
        'color',
        'rgb(62, 163, 62)',
      );
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_chat.feature
     * Scenario: Teacher sees notification
     *
     * Teacher enrolled in the ai-differentiation experiment opens the
     * notifications panel and sees two test notifications (expired notification
     * is absent).
     */
    test('teacher sees notifications panel', async ({page}) => {
      await createTeacher(page, {name: 'Stilgar'});
      await page.goto('/home');
      await addUserToExperiment(page, 'ai-differentiation');

      await page.goto('/teacher_dashboard/home');
      await page
        .locator('h2')
        .filter({hasText: 'Welcome, Stilgar'})
        .waitFor({state: 'visible', timeout: 30_000});
      await page
        .locator('#ui-floatingActionButton')
        .waitFor({state: 'visible', timeout: 20_000});

      // Wait for chat ready state.
      await page
        .locator('button')
        .filter({hasText: 'Suggest prompts'})
        .waitFor({state: 'visible', timeout: 30_000});

      // Open notifications panel.
      await page.locator('#ui-notificationsButton').click();
      await page
        .locator('p')
        .filter({hasText: 'Test notification no. 1'})
        .waitFor({state: 'visible', timeout: 15_000});
      await expect(
        page.locator('p').filter({
          hasText: 'The deepest parts of the ocean are totally unknown to us',
        }),
      ).toBeVisible();
      await expect(
        page.locator('p').filter({hasText: 'Test notification no. 2'}),
      ).toBeVisible();
      await expect(
        page.locator('p').filter({
          hasText: 'The town extends along a low and marshy level',
        }),
      ).toBeVisible();
      await expect(
        page.locator('p').filter({hasText: 'EXPIRED NOTIFICATION'}),
      ).not.toBeVisible();
    });

    /**
     * Migration status: COMPLETED
     * Source: dashboard/test/ui/features/teacher_tools/ai_diff/ai_differentiation_threads.feature
     * Scenario: Teacher can see threads and create new threads
     */
    test('teacher can see threads and create new threads', async ({
      page,
      eyes,
    }) => {
      await createTeacher(page, {name: 'Stilgar'});
      await page.goto('/home');
      await addUserToExperiment(page, 'ai-differentiation');

      await page.goto('/courses/ui-test-artist/units/1');
      await expectAiDiffThreadsVisualReady(page);

      await eyes.open('ai diff threads');
      await eyes.check('ai diff threads starting state', {
        ignoreRegions: aiDiffThreadDynamicIgnoreRegions(page),
      });
      await page
        .locator('#uitest-chat-textarea')
        .fill('Which lessons have a project');
      await page.locator('#uitest-chat-submit').click();
      await expect(
        page.locator('[aria-label="User chat message"]'),
      ).toContainText('Which lessons have a project');
      await page
        .locator('p')
        .filter({hasText: 'Lorem ipsum'})
        .first()
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(
        page.locator('li').filter({hasText: 'Which lessons have a project'}),
      ).toBeVisible({timeout: 30_000});

      await page.getByRole('button', {name: 'New Chat'}).click();
      await expect(
        page
          .locator('p')
          .filter({hasText: "Hi! I'm your AI Teaching Assistant"}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.getByRole('button', {name: 'Give me an example'}),
      ).toBeVisible();
      await expect(
        page.locator('[aria-label="User chat message"]'),
      ).not.toBeVisible();
      await eyes.check('ai diff threads new thread from button', {
        ignoreRegions: aiDiffThreadDynamicIgnoreRegions(page),
      });

      await page.locator('#uitest-chat-textarea').fill('How do I debug');
      await page.locator('#uitest-chat-submit').click();
      await expect(
        page.locator('[aria-label="User chat message"]'),
      ).toContainText('How do I debug');
      await page
        .locator('p')
        .filter({hasText: 'Lorem ipsum'})
        .first()
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(
        page.locator('li').filter({hasText: 'How do I debug'}),
      ).toBeVisible({timeout: 30_000});

      await page
        .locator('span')
        .filter({hasText: 'Which lessons have a project'})
        .click();
      await expect(
        page
          .locator('[aria-label="User chat message"]')
          .filter({hasText: 'Which lessons have a project'}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.locator('p').filter({hasText: 'Lorem ipsum'}).first(),
      ).toBeVisible();
      await eyes.check('ai diff threads display old thread', {
        ignoreRegions: aiDiffThreadDynamicIgnoreRegions(page),
      });

      await page.getByRole('button', {name: 'Suggest prompts'}).click();
      await page.getByRole('button', {name: 'Create'}).click();
      await page.getByRole('button', {name: 'Write a lesson hook'}).click();
      const responses = page.locator('p').filter({hasText: 'Lorem ipsum'});
      await expect(async () =>
        expect(await responses.count()).toBeGreaterThanOrEqual(2),
      ).toPass({timeout: 30_000, intervals: [500, 1000, 2000]});
      await eyes.check('ai diff threads continue old thread', {
        ignoreRegions: aiDiffThreadDynamicIgnoreRegions(page),
      });
    });
  },
);
