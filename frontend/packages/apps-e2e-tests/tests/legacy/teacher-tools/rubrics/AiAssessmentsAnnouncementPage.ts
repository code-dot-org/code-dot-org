import {expect, type Page} from '@playwright/test';

const NON_AI_UNIT_URL = '/courses/flappy/units/1';
const AI_UNIT_URL = '/courses/ui-test-csd-2025/units/1';

/**
 * Page object for the AI assessments announcement banner.
 */
export class AiAssessmentsAnnouncementPage {
  private readonly page: Page;

  /**
   * @param page - Playwright page under test
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Open a non-AI unit and assert the user-visible page is ready with no AI
   * assessments announcement banner.
   */
  async expectNoAnnouncementOnNonAiUnit(): Promise<void> {
    await this.page.goto(NON_AI_UNIT_URL, {waitUntil: 'domcontentloaded'});
    await expect(
      this.page.getByRole('heading', {name: 'Flappy Code'}),
    ).toBeVisible();
    await expect(
      this.page.locator('#uitest-ai-assessments-announcement'),
    ).not.toBeVisible();
  }

  /**
   * Open the AI-enabled unit and wait for the visible announcement banner.
   */
  async gotoAiUnitWithAnnouncement(): Promise<void> {
    await this.page.goto(AI_UNIT_URL, {waitUntil: 'domcontentloaded'});
    await expect(
      this.page.locator('#uitest-ai-assessments-announcement'),
    ).toBeVisible();
  }

  /**
   * Close the announcement and assert the banner disappears.
   */
  async closeAnnouncement(): Promise<void> {
    const seenResponse = this.waitForAnnouncementSeenPost();
    await this.page.locator('#ui-close-dialog').click();
    await expect(
      this.page.locator('#uitest-ai-assessments-announcement'),
    ).not.toBeVisible();
    await this.retryAnnouncementSeenAfterServerError(await seenResponse);
    await this.waitUntilAnnouncementMarkedSeen();
  }

  /**
   * Click the Learn More action while blocking the external code.org page, so
   * the dismissal can be verified inside the test-studio origin.
   */
  async clickLearnMoreWithoutLeavingStudio(): Promise<void> {
    await this.page.route(/^https:\/\/code\.org\//, route => route.abort());
    const seenResponse = this.waitForAnnouncementSeenPost();
    await this.page
      .locator('#uitest-ai-assessments-announcement .learn-more-button')
      .click();
    await this.retryAnnouncementSeenAfterServerError(await seenResponse);
    await this.waitUntilAnnouncementMarkedSeen();
    await this.page.unroute(/^https:\/\/code\.org\//);
  }

  /**
   * Reload the AI unit until the visible page is ready and the banner remains
   * absent. This is the user-visible persistence signal.
   */
  async expectAnnouncementDismissedOnAiUnit(): Promise<void> {
    await expect(async () => {
      await this.page.goto(AI_UNIT_URL, {waitUntil: 'domcontentloaded'});
      await expect(
        this.page.getByRole('heading', {name: 'Unit 1 - Problem Solving'}),
      ).toBeVisible();
      await expect(
        this.page.locator('#uitest-ai-assessments-announcement'),
      ).not.toBeVisible({timeout: 5_000});
    }).toPass({timeout: 30_000, intervals: [500, 1000, 2000]});
  }

  /**
   * Poll the test user endpoint until the server records the announcement as
   * seen. This is used only for Learn More, where the visible UI immediately
   * navigates away.
   */
  private async waitUntilAnnouncementMarkedSeen(): Promise<void> {
    await expect(async () => {
      const resp = await this.page.request.get('/api/v1/users/current');
      expect(resp.ok()).toBe(true);
      const json = (await resp.json()) as {
        has_seen_ai_assessments_announcement?: boolean;
      };
      expect(json.has_seen_ai_assessments_announcement).toBe(true);
    }).toPass({timeout: 60_000, intervals: [500, 1000, 2000, 5000]});
  }

  /**
   * Wait for the announcement dismissal POST sent by the visible close or Learn
   * More action.
   */
  private async waitForAnnouncementSeenPost(): Promise<number> {
    const response = await this.page
      .waitForResponse(
        resp =>
          resp.request().method() === 'POST' &&
          resp
            .url()
            .includes('/api/v1/users/has_seen_ai_assessments_announcement'),
        {timeout: 60_000},
      )
      .catch(() => undefined);
    if (!response) {
      return 599;
    }
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);
    return response.status();
  }

  /**
   * If test-studio returns a transient 5xx for the UI dismissal POST, retry the
   * same endpoint in the current authenticated session.
   *
   * @param firstStatus - status from the UI-triggered POST
   */
  private async retryAnnouncementSeenAfterServerError(
    firstStatus: number,
  ): Promise<void> {
    if (firstStatus < 500) {
      expect(firstStatus).toBeLessThan(400);
      return;
    }

    const csrf = await this.page
      .locator('meta[name="csrf-token"]')
      .getAttribute('content');
    let lastStatus = firstStatus;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await this.page.request.post(
        '/api/v1/users/has_seen_ai_assessments_announcement',
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrf ?? '',
          },
        },
      );
      lastStatus = response.status();
      if (response.ok()) {
        return;
      }
      if (lastStatus < 500 || attempt === 3) {
        break;
      }
    }
    expect(lastStatus).toBeLessThan(400);
  }
}
