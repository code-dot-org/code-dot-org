import {expect, type Page} from '@playwright/test';

/**
 * Colors for header progress-bubble assertions.
 * Source: dashboard/test/ui/features/step_definitions/progress.rb color_string()
 */
const PROGRESS_COLORS = {
  perfect_assessment: {bg: 'rgb(140, 82, 186)', border: 'rgb(140, 82, 186)'},
  attempted: {bg: 'rgb(254, 254, 254)', border: 'rgb(14, 190, 14)'},
} as const;

/**
 * Page object for student pair-programming flows.
 */
export class PairingPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens a level and waits for the visible lab readiness signal.
   *
   * @param url - level URL
   * @param readinessSelector - visible selector that indicates lab readiness
   */
  async gotoLevel(url: string, readinessSelector: string): Promise<void> {
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
    await this.waitForVisibleWithReload('.header_user');
    await this.waitForVisibleWithReload(readinessSelector);
  }

  /**
   * Opens the user menu, selects the first listed partner student, confirms the
   * pairing group, and waits for the visible pairing header state.
   *
   * @param name1 - first student display name
   * @param name2 - second student display name
   */
  async initiatePairing(name1: string, name2: string): Promise<void> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (await this.pairingGroupIsVisible(name1, name2)) {
          return;
        }
        await this.openPairingDialog();
        await this.selectPartner(name1);
        await this.confirmSelectedPartners();
        await this.expectPairingGroup(name1, name2);
        return;
      } catch (error) {
        if (await this.pairingGroupIsVisible(name1, name2)) {
          return;
        }
        if (attempt === 3) {
          throw error;
        }
      }
    }
  }

  /**
   * Reloads the level until the visible header shows the persisted pairing
   * group, re-initiating pairing through the UI if persistence has not caught
   * up yet.
   *
   * @param url - level URL
   * @param readinessSelector - visible selector that indicates lab readiness
   * @param name1 - first student display name
   * @param name2 - second student display name
   */
  async ensurePairingPersists(
    url: string,
    readinessSelector: string,
    name1: string,
    name2: string,
  ): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.gotoLevel(url, readinessSelector);
      try {
        await this.expectPairingGroup(name1, name2);
        return;
      } catch (error) {
        lastError = error;
        await this.initiatePairing(name1, name2);
      }
    }

    throw lastError;
  }

  /**
   * Opens the pairing dialog from the user menu.
   */
  private async openPairingDialog(): Promise<void> {
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible({timeout: 3_000}).catch(() => false)) {
      await this.page.evaluate(() =>
        (document.querySelector('#overlay') as HTMLElement)?.click(),
      );
      await overlay.waitFor({state: 'hidden', timeout: 10_000});
    }

    await this.page
      .locator('.display_name')
      .waitFor({state: 'visible', timeout: 10_000});
    await this.page.locator('.display_name').click();
    await this.page
      .locator('#pairing_link')
      .waitFor({state: 'visible', timeout: 10_000});
    await this.page.locator('#pairing_link').click();
  }

  /**
   * Selects a visible partner row by display name.
   *
   * @param name - partner display name
   */
  private async selectPartner(name: string): Promise<void> {
    const partner = this.page.locator('.student', {hasText: name}).first();
    await expect(partner).toBeVisible({timeout: 30_000});
    await partner.click();
    await expect(partner).toHaveClass(/selected/, {timeout: 10_000});
  }

  /**
   * Confirms selected partners and waits for the dialog to close.
   */
  private async confirmSelectedPartners(): Promise<void> {
    const addPartners = this.page.locator('.addPartners');
    await expect(addPartners).toBeVisible({timeout: 10_000});
    await addPartners.evaluate(element => (element as HTMLElement).click());
    await expect(addPartners).not.toBeVisible({timeout: 20_000});
  }

  /**
   * Waits for a visible selector, using the page's visible reload affordance if
   * the lab reports that it is taking longer than usual.
   *
   * @param selector - selector that signals page readiness
   */
  private async waitForVisibleWithReload(selector: string): Promise<void> {
    const target = this.page.locator(selector);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await expect(target).toBeVisible({timeout: 60_000});
        return;
      } catch (error) {
        const reloadLink = this.page.getByRole('link', {
          name: 'Try reloading the page',
        });
        if (
          attempt === 2 ||
          !(await reloadLink.isVisible({timeout: 1_000}).catch(() => false))
        ) {
          throw error;
        }
        await reloadLink.click();
      }
    }
  }

  /**
   * Verifies the header user menu reflects an active pairing group.
   *
   * @param name1 - first student display name
   * @param name2 - second student display name
   */
  async expectPairingGroup(name1: string, name2: string): Promise<void> {
    await this.page
      .locator('.user_menu')
      .waitFor({state: 'visible', timeout: 20_000});
    await this.page
      .locator('.pairing_name')
      .waitFor({state: 'visible', timeout: 20_000});
    await expect(this.page.locator('.pairing_name')).toContainText('Team');
    await this.page
      .locator('.fa-users')
      .waitFor({state: 'visible', timeout: 10_000});
    if (!(await this.page.locator('.pairing_summary').isVisible())) {
      await this.page.locator('.pairing_name').click();
    }
    await this.page
      .locator('.pairing_summary')
      .waitFor({state: 'visible', timeout: 10_000});
    await expect(this.page.locator('.pairing_summary')).toContainText(name1);
    await expect(this.page.locator('.pairing_summary')).toContainText(name2);
  }

  /**
   * Runs a level and waits for inline feedback.
   */
  async runForAttempt(): Promise<void> {
    await this.page.locator('#runButton').click();
    await this.page
      .locator('.uitest-topInstructions-inline-feedback')
      .waitFor({state: 'visible', timeout: 20_000});
  }

  /**
   * Runs and submits an assessment level, then waits for navigation.
   */
  async submitLevel(): Promise<void> {
    await this.page.locator('#runButton').click();
    await expect(this.page.locator('.project_updated_at')).toContainText(
      'Saved',
      {timeout: 60_000},
    );
    await this.page
      .locator('#submitButton')
      .waitFor({state: 'visible', timeout: 20_000});
    await this.page.locator('#submitButton').click();
    await this.page
      .locator('.modal')
      .waitFor({state: 'visible', timeout: 10_000});
    await Promise.all([
      this.page.waitForNavigation({timeout: 30_000}),
      this.page.locator('#confirm-button').click(),
    ]);
    await this.waitForVisibleWithReload('#runButton');
    await expect(this.page.locator('.project_updated_at')).toContainText(
      'Saved',
      {timeout: 60_000},
    );
  }

  /**
   * Verifies a header progress bubble's computed colors.
   *
   * @param levelNum - 1-based level number in the lesson
   * @param progressType - expected progress state
   */
  async expectHeaderProgress(
    levelNum: number,
    progressType: keyof typeof PROGRESS_COLORS,
  ): Promise<void> {
    const bubble = this.page
      .locator('.header_level .react_stage a')
      .nth(levelNum - 1)
      .locator('.progress-bubble');
    const {bg, border} = PROGRESS_COLORS[progressType];

    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await expect(async () => {
          const bgColor = await bubble.evaluate(
            el => getComputedStyle(el).backgroundColor,
          );
          const borderColor = await bubble.evaluate(
            el => getComputedStyle(el).borderTopColor,
          );
          expect(bgColor).toBe(bg);
          expect(borderColor).toBe(border);
        }).toPass({timeout: 15_000});
        return;
      } catch (error) {
        lastError = error;
        if (attempt < 3) {
          await this.page.reload({waitUntil: 'domcontentloaded'});
          await this.waitForVisibleWithReload('#runButton');
        }
      }
    }

    throw lastError;
  }

  /**
   * Return whether the visible header already shows the expected pairing group.
   * The cached-level scenario can reach "Team" before a retry observes the
   * dialog close, so retries must be idempotent.
   *
   * @param name1 - first student display name
   * @param name2 - second student display name
   */
  private async pairingGroupIsVisible(
    name1: string,
    name2: string,
  ): Promise<boolean> {
    return this.expectPairingGroup(name1, name2)
      .then(() => true)
      .catch(() => false);
  }
}
