import {expect, type Locator, type Page} from '@playwright/test';

import {BasePage} from '../base-page';

export class ManageStudentsPage extends BasePage {
  readonly table: Locator;
  readonly bulkSetModal: Locator;
  readonly bulkSetModalHeading: Locator;
  readonly bulkSetModalStateLabel: Locator;
  readonly bulkSetModalStateSelect: Locator;
  readonly bulkSetModalConsentLink: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.locator('#uitest-manage-students-table');
    this.bulkSetModal = page.getByRole('dialog', {
      name: 'Set state for all students',
    });
    this.bulkSetModalHeading = this.bulkSetModal.getByRole('heading', {
      name: 'Set state for all students',
    });
    // SimpleDropdown's <label> wraps the <select>, so the computed accessible
    // name includes option text — getByRole/getByLabel can't target precisely.
    this.bulkSetModalStateLabel = this.bulkSetModal
      .locator('label')
      .filter({hasText: 'State'});
    this.bulkSetModalStateSelect = this.bulkSetModal.locator('select#us-state');
    this.bulkSetModalConsentLink = this.bulkSetModal.getByRole('link', {
      name: 'Learn more about parental consent',
    });
  }

  async waitForTable(): Promise<void> {
    await expect(this.table).toBeVisible();
  }

  async openStateBulkSetModal(): Promise<void> {
    const stateHeader = this.table
      .getByRole('columnheader')
      .filter({hasText: 'State'});
    await expect(stateHeader).toBeVisible();
    await stateHeader.getByRole('button', {name: 'Actions'}).click();
    await this.page
      .getByRole('button', {name: 'Set state for all students'})
      .click();
    await expect(this.bulkSetModal).toBeVisible();
  }

  async bulkSetState(state: string): Promise<void> {
    await this.bulkSetModalStateSelect.selectOption(state);
    await this.bulkSetModal.getByRole('button', {name: 'Add'}).click();
    await expect(this.bulkSetModal).not.toBeVisible();
  }

  // Scoped to the table to avoid matching the bulk-set modal's combobox.
  firstRowStateSelect(): Locator {
    return this.table.getByRole('combobox', {name: 'State'});
  }

  async saveFirstRow(): Promise<void> {
    await this.table.getByRole('button', {name: 'Save'}).click();
    await expect(this.firstRowStateSelect()).not.toBeVisible();
  }

  firstRow(): Locator {
    return this.table.locator('tbody tr').first();
  }
}
