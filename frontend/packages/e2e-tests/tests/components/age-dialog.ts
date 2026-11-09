import {expect, type Locator, type Page} from '@playwright/test';

/**
 * COPPA/age-gate interstitial (apps/src/templates/AgeDialog.jsx), rendered
 * inline in Dance Party's visualization column for anonymous sessions. It
 * blocks only the song filter, not the whole lab — the Blockly workspace and
 * #runButton are already interactive while it is open.
 */
export class AgeDialogComponent {
  readonly dialog: Locator;

  readonly ageDropdown: Locator;

  readonly okButton: Locator;

  constructor(page: Page) {
    this.dialog = page.locator('.age-dialog');
    this.ageDropdown = this.dialog.getByRole('combobox');
    this.okButton = this.dialog.getByRole('button', {name: 'OK'});
  }

  /** Select an age and submit. 21 submits the dropdown's '21+' option. */
  async selectAge(age: number): Promise<void> {
    await expect(this.dialog).toBeVisible();
    const label = age === 21 ? '21+' : String(age);
    await this.ageDropdown.selectOption({label});
    await this.okButton.click();
    await expect(this.dialog).toBeHidden();
  }
}
