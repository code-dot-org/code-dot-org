import {createTeacher} from '../../../shared/auth';
import {expect, test} from '../../../shared/fixtures';

/**
 * AI Assessments Announcement — banner shown to teachers on AI-enabled units.
 *
 * Source: dashboard/test/ui/features/teacher_tools/rubrics/ai_assessments_announcement.feature
 */

const NON_AI_UNIT_URL = '/courses/flappy/units/1';
const AI_UNIT_URL = '/courses/ui-test-csd-2025/units/1';

/**
 * Poll /api/v1/users/current until has_seen_ai_assessments_announcement is
 * true.  Mirrors `I wait until ai assessments announcement is marked as seen`
 * from steps.rb.
 *
 * @param page - Playwright page with an active authenticated session
 */
async function waitUntilAnnouncementMarkedSeen(
  page: import('@playwright/test').Page,
): Promise<void> {
  await expect(async () => {
    const resp = await page.request.get('/api/v1/users/current');
    expect(resp.ok()).toBe(true);
    const json = (await resp.json()) as {
      has_seen_ai_assessments_announcement?: boolean;
    };
    expect(json.has_seen_ai_assessments_announcement).toBe(true);
  }).toPass({timeout: 30_000, intervals: [500, 1000, 2000]});
}

test.describe('AI Assessments Announcement', {tag: '@no_mobile'}, () => {
  /**
   * Source: ai_assessments_announcement.feature
   * "Teacher views and closes announcement"
   *
   * Non-AI unit shows no announcement; AI unit shows announcement; closing
   * it marks it seen and it does not reappear on reload.
   */
  test('teacher views and closes announcement', async ({page}) => {
    await createTeacher(page);

    // No announcement on a non-AI unit.
    await page.goto(NON_AI_UNIT_URL);
    await page
      .locator('#uitest-no-ai-assessments-announcement')
      .waitFor({state: 'visible', timeout: 30_000});

    // Announcement visible on an AI-enabled unit.
    await page.goto(AI_UNIT_URL);
    await page
      .locator('#uitest-ai-assessments-announcement')
      .waitFor({state: 'visible', timeout: 30_000});

    // Close the announcement.
    await page.locator('#ui-close-dialog').click();
    await expect(
      page.locator('#uitest-ai-assessments-announcement'),
    ).not.toBeVisible();
    await waitUntilAnnouncementMarkedSeen(page);

    // After reload the announcement remains absent.
    await page.goto(AI_UNIT_URL);
    await page
      .locator('#uitest-no-ai-assessments-announcement')
      .waitFor({state: 'visible', timeout: 30_000});
  });

  /**
   * Source: ai_assessments_announcement.feature
   * "Teacher views announcement and clicks learn more"
   *
   * Clicking the Learn More button navigates away; returning to the AI unit
   * no longer shows the announcement.
   */
  test('teacher clicks learn more and announcement stays dismissed', async ({
    page,
  }) => {
    await createTeacher(page);
    await page.goto(AI_UNIT_URL);
    await page
      .locator('#uitest-ai-assessments-announcement')
      .waitFor({state: 'visible', timeout: 30_000});

    // Learn More navigates away (the announcement is implicitly dismissed).
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page
        .locator('#uitest-ai-assessments-announcement .learn-more-button')
        .click(),
    ]);

    // Back on the AI unit: no announcement.
    await page.goto(AI_UNIT_URL);
    await page
      .locator('#uitest-no-ai-assessments-announcement')
      .waitFor({state: 'visible', timeout: 30_000});
  });
});
