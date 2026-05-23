import {AxeBuilder} from '@axe-core/playwright';
import {expect, test} from 'playwright/test';

import {FishVTrashPage} from './poms/FishVTrashPage';
import {AppMode, OceansPage} from './poms/OceansPage';

/** Extended test that provides a pre-navigated OceansPage with guides loaded. */
const guideTest = test.extend<{p: OceansPage}>({
  p: async ({page}, use) => {
    const instance = new OceansPage(page);
    await instance.goto(AppMode.FishVTrash, {guides: 'HoC'});
    await expect(instance.guideDialog).toBeVisible();
    await expect(instance.guideDialog).toBeFocused();
    await use(instance);
  },
});

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

  test('Pause button is focused after Run', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.playPauseButton).toBeFocused();
  });

  // ─── C1: ConfirmationDialog focus management gaps ────────────────────────
  // These three tests document confirmed WCAG 2.1 AA findings (C1) and are
  // expected to FAIL until the fixes land.  Each test targets a distinct
  // property: aria-modal presence, focus-on-open, and Tab containment.

  test('C1: confirmation dialog carries aria-modal="true"', async ({page}) => {
    // ARIA authoring practices §3.8 require aria-modal on modal dialogs so
    // AT can infer that background content is inert.  The current dialog box
    // (role="dialog") has no aria-modal attribute.
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.click();
    await expect(oceans.confirmationDialog).toBeVisible();
    await expect(oceans.confirmationDialog).toHaveAttribute(
      'aria-modal',
      'true',
    );
  });

  test('C1: focus moves into the confirmation dialog when it opens', async ({
    page,
  }) => {
    // componentDidMount focuses the last button (Cancel — safer default than
    // the destructive Erase).  Use a locator-based assertion instead of
    // elementHandle + evaluate so Playwright auto-retries the check.
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.click();
    await expect(oceans.confirmationDialog).toBeVisible();
    await expect(oceans.confirmationCancelButton).toBeFocused();
  });

  test('C1: confirmation dialog is opened as a browser-native modal', async ({
    page,
  }) => {
    // The dialog must be opened via showModal() so the browser enforces Tab
    // trapping natively across all platforms.  The CSS :modal pseudo-class is
    // only set by showModal() — it is not set by <dialog open> or role="dialog"
    // divs — making it a reliable cross-browser signal that the modal state
    // (and its built-in Tab trap) is active.
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.click();
    await expect(oceans.confirmationDialog).toBeVisible();
    // Wrap in toPass for auto-retry in case React hasn't committed aria-modal yet.
    await expect(page.locator('dialog[aria-modal]:modal')).toBeVisible();
  });

  // ─── M1: Train count aria-live ──────────────────────────────────────────
  // #uitest-train-count carries role="status" (implicit aria-live="polite")
  // so AT announces classification count updates automatically.

  test('M1: train count element has role="status" or aria-live', async ({
    page,
  }) => {
    const oceans = await FishVTrashPage.load(page);
    // role="status" is the implemented fix; accept aria-live as an alternative.
    await expect(
      oceans.trainCount,
      'Expected #uitest-train-count to have role="status" or aria-live',
    ).toHaveAttribute('role', 'status');
  });

  // ─── M2: Rewind/FF speed reflected in aria-label ────────────────────────
  // When the user activates Rewind (or Fast forward) the speed cycles from
  // ×1 to ×2.  The button's aria-label stays "Rewind" / "Fast forward" and
  // never communicates the active speed, leaving AT users with no indication
  // that the speed changed.  Fix: update aria-label to include the multiplier
  // when timeScale !== 1, e.g. "Rewind x2".

  test('M2: Rewind aria-label includes speed when active at ×2', async ({
    page,
  }) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.mediaControlsContainer).toBeVisible();

    // One click cycles timeScale from 1 → 2 (timeScales = [1, 2]).
    // aria-label must update to include the multiplier.
    await oceans.rewindButton.click();

    // Accept any label that contains both "Rewind" (case-insensitive) and
    // the speed multiplier "2", e.g. "Rewind x2" or "Rewind ×2".
    await expect(oceans.rewindButton).toHaveAttribute(
      'aria-label',
      /rewind.+2/i,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Guide focus management
// ─────────────────────────────────────────────────────────────────────────────

guideTest.describe('Guide focus', () => {
  guideTest(
    'modal guide dialog receives focus when it appears',
    async ({p}) => {
      await expect(p.guideDialog).toBeFocused();
    },
  );

  guideTest('guide dialog carries aria-label with guide text', async ({p}) => {
    await expect(p.guideDialog).toHaveAttribute('aria-label', /.+/);
  });

  guideTest('modal guide has aria-modal="true"', async ({p}) => {
    await expect(p.guideDialog).toHaveAttribute('aria-modal', 'true');
  });

  guideTest('Tab is trapped inside modal guide', async ({p}) => {
    await p.guideDialog.focus();
    await p.page.keyboard.press('Tab');
    await expect(p.guideDialog).toBeFocused();
  });

  guideTest('Enter dismisses the current guide', async ({p}) => {
    const labelBefore = await p.guideDialog.getAttribute('aria-label');
    // Press Enter inside the retry loop: guideShowing is false while Typist
    // animates, so the first Enter may be a no-op.  toPass retries (press +
    // check) until the guide advances or the overlay closes entirely.
    await expect(async () => {
      const visible = await p.guideOverlay.isVisible();
      if (!visible) return;
      await p.guideDialog.press('Enter');
      if (!(await p.guideOverlay.isVisible())) return;
      await expect(p.guideDialog).not.toHaveAttribute(
        'aria-label',
        labelBefore!,
      );
    }).toPass({timeout: 20_000});
  });

  // Fish button test uses FishVTrashPage directly — doesn't need the guide fixture.
  test('Fish button is focused after all guides are dismissed', async ({
    page,
  }) => {
    const p = new FishVTrashPage(page);
    await p.goto(AppMode.FishVTrash, {guides: 'HoC'});
    await p.dismissAllGuides();
    // toBeFocused() reports "inactive" when document lost window focus during
    // the click sequence.  Check activeElement directly instead.
    await expect(async () => {
      const focused = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-guide-dismiss-focus'),
      );
      expect(focused).toBe('true');
    }).toPass({timeout: 5_000});
  });
});
