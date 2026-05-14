import {expect, test} from '@playwright/test';

import {PKC} from './PKC';

/**
 * Public Key Cryptography — Continue button regression test.
 *
 * Source: dashboard/test/ui/features/star_labs/public_key_cryptography/continue_button.feature
 * Scenario: Clicking the continue button
 *
 * Regression guard: refactoring the lab2 continue-button logic once broke this
 * standalone CSP widget. Verify the last Continue button on level 1 advances
 * to level 2 and the "Pick a character" screen is shown.
 */
test.describe('Public Key Cryptography — continue button', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/public_key_cryptography/continue_button.feature
   * Scenario: Clicking the continue button
   */
  test('last Continue button advances to level 2', async ({page}) => {
    const pkc = new PKC(page);
    await pkc.gotoLevel(1);

    await pkc.clickLastContinueButton();

    await expect(pkc.mount).toContainText('Pick a character');
    await expect(page).toHaveURL(/\/lessons\/31\/levels\/2/);
  });
});
