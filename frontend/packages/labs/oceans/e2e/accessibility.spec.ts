import {AxeBuilder} from '@axe-core/playwright';
import {expect, test} from 'playwright/test';

import {FishVTrashPage} from './poms/FishVTrashPage';

// ─────────────────────────────────────────────────────────────────────────────
// Automated WCAG scanning — catches structural a11y violations early.
// ─────────────────────────────────────────────────────────────────────────────

// color-contrast is disabled because the ocean lab's design palette (red,
// orange, teal on white; white on dark) predates WCAG compliance work and
// is tracked as a separate design-system issue.  All other WCAG 2.1 AA
// structural rules (roles, labels, keyboard, focus order) are enforced.
const axeBuilder = (page: Parameters<typeof AxeBuilder>[0]['page']) =>
  new AxeBuilder({page})
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast']);

/** Compact violation summary for assertion failure messages. */
function summarize(
  violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'],
) {
  return JSON.stringify(
    violations.map(v => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map(n => n.html),
    })),
    null,
    2,
  );
}

test.describe('Automated WCAG scan (axe-core)', () => {
  test('training scene has no structural WCAG 2.1 AA violations', async ({
    page,
  }) => {
    await FishVTrashPage.load(page);
    const results = await axeBuilder(page).analyze();
    expect(results.violations, summarize(results.violations)).toEqual([]);
  });

  test('erase confirmation dialog has no structural WCAG 2.1 AA violations', async ({
    page,
  }) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.click();
    await expect(oceans.confirmationDialog).toBeVisible();
    const results = await axeBuilder(page).analyze();
    expect(results.violations, summarize(results.violations)).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ARIA roles and attributes
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test('erase button has descriptive aria-label', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    // I18n.t('erase') = "Erase" (capital E per oceans.json)
    await expect(oceans.eraseButton).toHaveAttribute('aria-label', 'Erase');
  });

  test('pond toggle buttons have descriptive aria-labels', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.fullFlow();
    await expect(oceans.toggleMatchingButton).toHaveAttribute(
      'aria-label',
      'Switch to Matching Items',
    );
    await expect(oceans.toggleNonMatchingButton).toHaveAttribute(
      'aria-label',
      'Switch to Non-Matching Items',
    );
  });

  test('yes and no buttons are keyboard-focusable', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    // Programmatic focus (the DemoShell mode-picker sits above the lab in
    // tab order, so Tab alone would hit a radio first).
    await oceans.yesButton.focus();
    await expect(oceans.yesButton).toBeFocused();
    await expect(oceans.yesButton).toHaveAttribute('type', 'button');

    await oceans.noButton.focus();
    await expect(oceans.noButton).toBeFocused();
    await expect(oceans.noButton).toHaveAttribute('type', 'button');
  });

  test('yes button is activatable by keyboard Enter', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.classifyOne(true, 'key');
    await expect(oceans.trainCount).toHaveText('1');
  });

  test('erase button has type=button (no accidental form submit)', async ({
    page,
  }) => {
    const oceans = await FishVTrashPage.load(page);
    await expect(oceans.eraseButton).toHaveAttribute('type', 'button');
  });

  test('media control buttons have explicit aria-labels', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.mediaControlsContainer).toBeVisible();
    await expect(oceans.rewindButton).toHaveAttribute('aria-label', 'Rewind');
    await expect(oceans.fastForwardButton).toHaveAttribute(
      'aria-label',
      'Fast forward',
    );
  });

  test('FontAwesome icons are hidden from screen readers', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    // Verify SVGs inside the training yes/no buttons carry aria-hidden
    const svgCount =
      (await oceans.yesButton.locator('svg').count()) +
      (await oceans.noButton.locator('svg').count());
    const hiddenCount =
      (await oceans.yesButton.locator('svg[aria-hidden]').count()) +
      (await oceans.noButton.locator('svg[aria-hidden]').count());
    expect(hiddenCount).toBe(svgCount);
  });

  // ─── Confirmation dialog ─────────────────────────────────────────────────

  test('confirmation dialog has role=dialog and a heading', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.click();
    await expect(oceans.confirmationDialog).toBeVisible();
    await expect(oceans.confirmationHeader).toBeVisible();
  });

  test('focus returns to erase button after dialog cancel', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.focus();
    await oceans.eraseButton.press('Enter');
    await expect(oceans.confirmationDialog).toBeVisible();
    await oceans.confirmationCancelButton.click();
    // Per ARIA authoring practices, focus must return to the element that
    // opened the dialog when it is dismissed.
    await expect(oceans.eraseButton).toBeFocused();
  });

  test('focus returns to erase button after dialog confirm', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.focus();
    await oceans.eraseButton.press('Enter');
    await expect(oceans.confirmationDialog).toBeVisible();
    await oceans.confirmationEraseButton.click();
    await expect(oceans.eraseButton).toBeFocused();
  });
});
