import {expect, type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/** Page object for a section roster's manage-students table (teacher dashboard). */
export class ManageStudentsPage extends BasePage {
  /** #uitest-manage-students-table. */
  readonly table: Locator;

  /** #us-state-column-bulk-set-modal — the US-state bulk-set dialog. */
  readonly bulkSetModal: Locator;

  /** The bulk-set modal's heading. */
  readonly bulkSetModalHeading: Locator;

  /** The bulk-set modal's "State" label. */
  readonly bulkSetModalStateLabel: Locator;

  /** The bulk-set modal's state <select>. */
  readonly bulkSetModalStateSelect: Locator;

  /** The bulk-set modal's parental-consent link. */
  readonly bulkSetModalConsentLink: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.locator('#uitest-manage-students-table');
    this.bulkSetModal = page.locator('#us-state-column-bulk-set-modal');
    this.bulkSetModalHeading = this.bulkSetModal.getByRole('heading', {
      name: 'Set state for all students',
    });
    // Scoped by CSS id, not a role/label query: the <select> sits in a <label>
    // whose accessible name also swallows every <option>'s text (Playwright
    // computes it from the label's full text content), so getByLabel/getByRole
    // can't target it precisely. Filed as an accessibility gap.
    this.bulkSetModalStateLabel = this.bulkSetModal
      .locator('label')
      .filter({hasText: 'State'});
    this.bulkSetModalStateSelect = this.bulkSetModal.locator('select#us-state');
    this.bulkSetModalConsentLink = this.bulkSetModal.getByRole('link', {
      name: 'Learn more about parental consent',
    });
  }

  /** From the teacher dashboard, open the section's roster via the section-options dropdown. */
  async openRoster(): Promise<void> {
    await this.page.goto('/teacher_dashboard/home');
    const dropdownTrigger = this.page.getByRole('button', {
      name: 'Section options dropdown',
    });
    await expect(dropdownTrigger).toBeVisible();
    await dropdownTrigger.click();
    await this.page.getByRole('link', {name: 'Roster'}).click();
    await expect(this.table).toBeVisible();
  }

  /** Open the US-state bulk-set modal via the State column header's actions menu. */
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

  /** Select a state in the bulk-set modal and apply it to every student row. */
  async bulkSetState(state: string): Promise<void> {
    await this.bulkSetModalStateSelect.selectOption(state);
    await this.bulkSetModal.getByRole('button', {name: 'Add'}).click();
    await expect(this.bulkSetModal).not.toBeVisible();
  }

  /**
   * The editable US-state <select> for the row mid-edit. The section has a
   * single student, so the accessible-name query is unambiguous; scoped to
   * the table to avoid matching the bulk-set modal's own "State" combobox.
   */
  firstRowStateSelect(): Locator {
    return this.table.getByRole('combobox', {name: 'State'});
  }

  /** Save the first student row's edits (the state <select> disappears once persisted). */
  async saveFirstRow(): Promise<void> {
    await this.table.getByRole('button', {name: 'Save'}).click();
    await expect(this.firstRowStateSelect()).not.toBeVisible();
  }

  /** The first student row, for post-reload persisted-value assertions. */
  firstRow(): Locator {
    return this.table.locator('tbody tr').first();
  }
}
