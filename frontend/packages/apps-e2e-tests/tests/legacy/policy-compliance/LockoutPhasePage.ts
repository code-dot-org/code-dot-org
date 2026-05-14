import {type Locator, type Page} from '@playwright/test';

import {expect} from '../../shared/fixtures';

/**
 * Page object for Child Account Policy lockout-phase account settings checks.
 */
export class LockoutPhasePage {
  private readonly page: Page;
  private readonly editAccountHeading: Locator;
  private readonly ageField: Locator;
  private readonly stateField: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.editAccountHeading = page.getByRole('heading', {
      name: 'Edit Account Details',
    });
    this.ageField = page.locator('#user_age').first();
    this.stateField = page.locator('#user_us_state').first();
  }

  /**
   * Opens account settings and waits for visible account-edit readiness signals.
   */
  public async gotoEditAndWaitForFields(): Promise<void> {
    await this.page.goto('/users/edit');
    await expect(this.editAccountHeading).toBeVisible({timeout: 15_000});
    await expect(this.ageField).toBeVisible({timeout: 15_000});
    await expect(this.stateField).toBeVisible({timeout: 15_000});
  }

  /**
   * Asserts that the age and state fields cannot be edited.
   */
  public async expectAgeAndStateDisabled(): Promise<void> {
    await expect(this.stateField).toBeDisabled();
    await expect(this.ageField).toBeDisabled();
  }

  /**
   * Asserts that the age and state fields can be edited.
   */
  public async expectAgeAndStateEnabled(): Promise<void> {
    await expect(this.stateField).toBeEnabled();
    await expect(this.ageField).toBeEnabled();
  }
}
