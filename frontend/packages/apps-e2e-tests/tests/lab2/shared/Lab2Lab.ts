import {type Locator, type Page} from '@playwright/test';

/**
 * Abstract base for lab2-architecture lab POMs.
 *
 * Lab2 labs share the instructions/validation UI from the lab2 framework:
 * `#instructions-feedback-message` and `#instructions-continue-button`.
 * Each subclass supplies the URL scheme and its own ready signal.
 */
export abstract class Lab2Lab {
  protected readonly page: Page;

  /**
   * Validation feedback rendered by lab2 NavigationArea after Run.
   * The element also contains the continue-button label when validation
   * passes (next: true), so use `toContainText` not `toHaveText` here.
   */
  readonly feedbackMessage: Locator;

  /** Continue/next-level button shown when validation passes (next: true). */
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.feedbackMessage = page.locator('#instructions-feedback-message');
    this.continueButton = page.locator('#instructions-continue-button');
  }

  /** Returns the path+query for the given level number. */
  protected abstract buildLevelUrl(level: number): string;

  /**
   * Waits until the lab UI is fully initialized and interactive.
   * Implementations should wait for the DOM signal that confirms the lab
   * has mounted its editor/workspace (not just that the page loaded).
   */
  protected abstract waitForReady(): Promise<void>;

  /**
   * Navigates to the given level and waits until the lab is ready.
   * Resets session first, mirroring the Cucumber Background pattern.
   */
  async gotoLevel(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(this.buildLevelUrl(level));
    await this.waitForReady();
  }
}
