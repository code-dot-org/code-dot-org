import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Click the lightbulb and confirm the hint request via the "Yes" prompt.
 * Mirrors `I view the next authored hint` from authoredHints.rb:
 *   click #lightbulb → wait for .csf-top-instructions button:contains(Yes) → click it.
 *
 * @param page - Playwright page with a CSF level open
 */
export async function viewNextHint(page: Page): Promise<void> {
  const okButton = page.getByRole('button', {name: 'OK', exact: true});
  if (await okButton.isVisible().catch(() => false)) {
    await clickButtonUntilHidden(okButton);
  }

  await page.locator('#lightbulb').click();
  const yesButton = page.getByRole('button', {name: 'Yes', exact: true});
  await expect(yesButton).toBeVisible();
  await clickButtonUntilHidden(yesButton);
}

/**
 * Clicks a prompt button until the visible prompt is dismissed.
 * Firefox can report a successful pointer click on these legacy instruction
 * controls without the React handler observing it, so fall back to the same
 * element activation Cucumber gets from Selenium.
 *
 * @param button - prompt button to activate
 */
async function clickButtonUntilHidden(button: Locator): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await button.click();
    try {
      await expect(button).not.toBeVisible({timeout: 2_000});
      return;
    } catch {
      if (attempt === 2) {
        break;
      }
    }
  }

  await button.evaluate(element => (element as HTMLElement).click());
  await expect(button).not.toBeVisible();
}

/**
 * Asserts the hint lightbulb shows the given remaining-hints count badge.
 * Mirrors `the hint lightbulb shows N hints available` from authoredHints.rb.
 *
 * @param page - Playwright page
 * @param count - expected badge number (must be ≥ 1)
 */
export async function expectHintCount(
  page: Page,
  count: number,
): Promise<void> {
  await expect(page.locator('#lightbulb')).toBeVisible();
  await expect(page.locator('#hintCount')).toHaveText(String(count));
}

/**
 * Asserts the hint lightbulb has no remaining-hints badge (all hints shown).
 * Mirrors `the hint lightbulb shows no hints available` from authoredHints.rb.
 *
 * @param page - Playwright page
 */
export async function expectNoHintCount(page: Page): Promise<void> {
  await expect(page.locator('#lightbulb')).toBeVisible();
  await expect(page.locator('#hintCount')).not.toBeAttached();
}

/**
 * Asserts the CSF top-instructions panel contains a rendered Blockly block space.
 * Mirrors `I see jquery selector .csf-top-instructions .block-space`.
 *
 * @param page - Playwright page
 */
export async function expectHintBlockSpace(page: Page): Promise<void> {
  await expect(
    page.locator('.csf-top-instructions .block-space'),
  ).toBeVisible();
}

/**
 * Returns the `.csf-top-instructions` content locator for text assertions.
 *
 * @param page - Playwright page
 * @returns locator for the instructions panel
 */
export function hintPanel(page: Page): Locator {
  return page.locator('.csf-top-instructions');
}
