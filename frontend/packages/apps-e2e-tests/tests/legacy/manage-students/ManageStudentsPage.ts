import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for the teacher dashboard roster manage-students table.
 */
export class ManageStudentsPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the selected section roster from the teacher dashboard.
   */
  async openRoster(): Promise<void> {
    await this.page.goto('/teacher_dashboard/home');
    await this.page
      .locator('#section-options-dropdown-dropdown-button')
      .waitFor({state: 'visible', timeout: 30_000});
    await this.page
      .locator('#section-options-dropdown-dropdown-button')
      .click();
    await this.page.locator('#ui-test-Roster').click();
    await this.table.waitFor({state: 'visible', timeout: 30_000});
  }

  /**
   * Opens the US state bulk-set modal.
   */
  async openStateBulkSetModal(): Promise<void> {
    const stateHeader = this.table.getByRole('columnheader', {
      name: /State Actions/,
    });
    await stateHeader.waitFor({state: 'visible', timeout: 30_000});
    await stateHeader.getByRole('button', {name: 'Actions'}).click();
    await this.page
      .getByRole('button', {name: 'Set state for all students'})
      .click();
    await expect(this.modal).toBeVisible();
  }

  /**
   * Asserts the state bulk-set modal content.
   */
  async expectStateBulkSetModal(): Promise<void> {
    await expect(
      this.modal.getByRole('heading', {name: 'Set state for all students'}),
    ).toBeVisible();
    await expect(
      this.modal.locator('label').filter({hasText: 'State'}),
    ).toBeVisible();
    await expect(this.modal.locator('select#us-state')).toHaveValue('');
    await expect(this.modal).toContainText(
      'Please be sure to choose the correct state',
    );
    await expect(
      this.modal.getByRole('link', {name: /Learn more about parental consent/}),
    ).toHaveAttribute(
      'href',
      /https:\/\/support\.code\.org\/hc\/en-us\/articles\/15465423491085/,
    );
  }

  /**
   * Applies one state to every visible student row.
   *
   * @param state - US state code
   */
  async bulkSetState(state: string): Promise<void> {
    await this.modal.locator('select#us-state').selectOption(state);
    await this.modal.getByRole('button', {name: 'Add'}).click();
    await expect(this.modal).not.toBeVisible();
  }

  /**
   * Saves the first student's edited state and verifies it persists after reload.
   *
   * @param studentName - student display name
   * @param state - expected US state code
   */
  async saveFirstStudentState(
    studentName: string,
    state: string,
  ): Promise<void> {
    const stateSelect = this.page.getByRole('combobox', {name: 'State'});
    await expect(stateSelect).toHaveValue(state);
    await this.page.getByRole('button', {name: 'Save'}).click();
    await expect(stateSelect).not.toBeVisible({
      timeout: 30_000,
    });

    await this.page.reload();
    await this.table.waitFor({state: 'visible', timeout: 30_000});
    await expect(
      this.table
        .getByRole('row')
        .filter({hasText: studentName})
        .filter({hasText: state})
        .first(),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Enables roster edit-all mode, fills the first student's family name, and
   * saves the change.
   *
   * @param studentName - visible student display name
   * @param familyName - family name to save
   */
  async saveFamilyNameForStudent(
    studentName: string,
    familyName: string,
  ): Promise<void> {
    await expect(this.table.getByText(studentName).first()).toBeVisible({
      timeout: 30_000,
    });
    await this.table
      .getByRole('columnheader', {name: /^Actions/})
      .getByRole('button', {name: 'Actions'})
      .last()
      .click();
    await this.page.getByRole('button', {name: 'Edit all'}).click();
    const familyNameInput = this.page.locator(
      "input[name='uitest-family-name']",
    );
    await expect(familyNameInput).toBeEnabled({timeout: 30_000});
    await familyNameInput.fill(familyName);
    await expect(familyNameInput).toHaveValue(familyName);
    await this.page
      .getByRole('button', {name: 'Save'})
      .evaluate(element => (element as HTMLElement).click());
    await expect(familyNameInput).not.toBeVisible({timeout: 30_000});
    await expect(this.table).toContainText(familyName, {timeout: 30_000});
  }

  private get table(): Locator {
    return this.page.locator('#uitest-manage-students-table');
  }

  private get modal(): Locator {
    return this.page.locator('#us-state-column-bulk-set-modal');
  }
}
