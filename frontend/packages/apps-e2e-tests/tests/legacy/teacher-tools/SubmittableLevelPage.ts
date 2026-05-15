import {expect, type Page} from '@playwright/test';

/**
 * Page object for submittable and lockable allthethingscourse levels.
 */
export class SubmittableLevelPage {
  private readonly page: Page;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the submittable multiple-choice level and waits for visible choices.
   */
  async gotoSubmittableLevel(): Promise<void> {
    await this.page.goto(
      '/courses/allthethingscourse/units/1/lessons/9/levels/3?noautoplay=true',
      {waitUntil: 'domcontentloaded'},
    );
    await expect(
      this.page.getByRole('heading', {name: 'Submittable Multiple choice'}),
    ).toBeVisible({timeout: 30_000});
    await expect(
      this.page.getByRole('button', {name: /A\.\s+blue/}),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Selects the first answer and submits the level.
   */
  async answerAndSubmit(): Promise<void> {
    await this.page.getByRole('button', {name: /A\.\s+blue/}).click();
    await expect(this.page.locator('.submitButton')).toBeEnabled({
      timeout: 15_000,
    });
    await this.page.locator('.submitButton:visible').click();
    await expect(this.page.locator('.submitButton:visible')).toBeDisabled({
      timeout: 30_000,
    });
  }

  /**
   * Reloads the submitted puzzle and verifies the submitted state.
   */
  async expectSubmittedAfterReload(): Promise<void> {
    await this.gotoSubmittableLevel();
    await this.page.reload({waitUntil: 'domcontentloaded'});
    await expect(this.page.locator('.unsubmitButton:visible')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the allthethingscourse unit overview and waits for the lockable row.
   */
  async gotoUnitOverview(): Promise<void> {
    await this.page.goto('/courses/allthethingscourse/units/1', {
      waitUntil: 'domcontentloaded',
    });
    await expect(
      this.page.getByRole('heading', {name: 'All the Things!'}),
    ).toBeVisible({timeout: 30_000});
    await expect(this.page.locator('table:visible').first()).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the first lockable level and waits for the submit control.
   */
  async gotoLockableLevel(): Promise<void> {
    await this.page.goto(
      '/courses/allthethingscourse/units/1/lockable/1/levels/1/page/1',
      {waitUntil: 'domcontentloaded'},
    );
    await expect(this.page.locator('.submitButton')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the level header popup and waits for its progress content.
   */
  async openHeaderProgressPopup(): Promise<void> {
    await this.page.locator('.header_popup_link').click();
    await expect(this.page.locator('.react_stage')).toBeVisible({
      timeout: 30_000,
    });
  }
}
