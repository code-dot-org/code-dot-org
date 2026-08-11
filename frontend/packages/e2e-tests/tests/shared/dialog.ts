import {type Page} from '@playwright/test';

/**
 * Dismiss whichever dialog is currently open, legacy or DSCO. Legacy
 * BaseDialog renders `#x-close`; DSCO CustomDialog renders a button with
 * `aria-label="Close"` inside `[role="dialog"]`. Both selectors can match
 * simultaneously (a dismissed legacy dialog stays mounted, just hidden), so
 * `:visible` scopes the click to whichever one is actually on screen.
 * Cucumber: "I close the dialog".
 */
export async function closeDialog(page: Page): Promise<void> {
  const closeButton = page.locator(
    '#x-close:visible, [role="dialog"] button[aria-label="Close"]:visible',
  );
  await closeButton.click();
}
