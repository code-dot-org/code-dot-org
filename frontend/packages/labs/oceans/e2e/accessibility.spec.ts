import {AxeBuilder} from '@axe-core/playwright';
import {expect, test} from 'playwright/test';

import {FishVTrashPage} from './poms/FishVTrashPage';
import {AppMode, OceansPage} from './poms/OceansPage';

/** Extended test that provides a pre-navigated OceansPage with guides loaded. */
const guideTest = test.extend<{p: OceansPage}>({
  p: async ({page}, use) => {
    // Bring tab to foreground so animation timers aren't throttled.
    await page.context().pages()[0]?.bringToFront();
    const instance = new OceansPage(page);
    await instance.goto(AppMode.FishVTrash, {guides: 'HoC'});
    await instance.guideDialog.waitFor({state: 'visible'});
    await use(instance);
  },
});

/*
 * Automated WCAG scanning — catches structural a11y violations early.
 */

// color-contrast is tracked as a separate design-system concern.
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

/*
 * ARIA roles and attributes
 */

test.describe('Accessibility', () => {
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

  /* Confirmation dialog */

  test('focus returns to erase button after dialog cancel', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.focus();
    await oceans.eraseButton.press('Enter');
    await expect(oceans.confirmationDialog).toBeVisible();
    await oceans.confirmationCancelButton.click();
    // ARIA: focus returns to the opener.
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

  test('confirmation dialog is opened as a browser-native modal', async ({
    page,
  }) => {
    // :modal asserts the dialog was opened modally, not just shown.
    const oceans = await FishVTrashPage.load(page);
    await oceans.eraseButton.click();
    await expect(oceans.confirmationDialog).toBeVisible();
    await expect(page.locator('dialog[aria-modal]:modal')).toBeVisible();
  });

  test('Rewind aria-label includes speed when active at ×2', async ({page}) => {
    const oceans = await FishVTrashPage.load(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.mediaControlsContainer).toBeVisible();

    // One click cycles timeScale 1 → 2; aria-label gains the multiplier.
    await oceans.rewindButton.click();

    // Matches "Rewind x2" or "Rewind ×2".
    await expect(oceans.rewindButton).toHaveAttribute(
      'aria-label',
      /rewind.+2/i,
    );
  });
});

/*
 * Guide focus management
 */

guideTest.describe('Guide focus', () => {
  guideTest(
    'modal guide dialog receives focus when it appears',
    async ({p}) => {
      // Probe activeElement directly; the matcher misreports focus in headless.
      await expect(async () => {
        const isFocused = await p.page.evaluate(() => {
          const dialog = document.querySelector('dialog.guide-dialog');
          return document.activeElement === dialog;
        });
        expect(isFocused).toBe(true);
      }).toPass({timeout: 5_000});
    },
  );

  guideTest('guide dialog carries aria-label with guide text', async ({p}) => {
    // Retry: aria-label may not be committed on first poll.
    await expect(async () => {
      await expect(p.guideDialog).toHaveAttribute('aria-label', /.+/);
    }).toPass({timeout: 5_000});
  });

  guideTest('modal guide has aria-modal="true"', async ({p}) => {
    await expect(async () => {
      await expect(p.guideDialog).toHaveAttribute('aria-modal', 'true');
    }).toPass({timeout: 5_000});
  });

  guideTest('Tab is trapped inside modal guide', async ({p}) => {
    await p.guideDialog.focus();
    await p.page.keyboard.press('Tab');
    // See above: probe activeElement directly.
    await expect(async () => {
      const isFocused = await p.page.evaluate(() => {
        const dialog = document.querySelector('dialog.guide-dialog');
        return document.activeElement === dialog;
      });
      expect(isFocused).toBe(true);
    }).toPass({timeout: 5_000});
  });

  guideTest('Enter dismisses the current guide', async ({p}) => {
    const labelBefore = await p.guideDialog.getAttribute('aria-label');
    // Enter is a no-op while Typist animates; retry press+check until it lands.
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

  // Uses FishVTrashPage directly — no guide fixture needed.
  test('Fish button is focused after all guides are dismissed', async ({
    page,
  }) => {
    const p = new FishVTrashPage(page);
    await p.goto(AppMode.FishVTrash, {guides: 'HoC'});
    await p.dismissAllGuides();
    // toBeFocused() can report "inactive" after a click flurry; probe directly.
    await expect(async () => {
      const focused = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-guide-dismiss-focus'),
      );
      expect(focused).toBe('true');
    }).toPass({timeout: 5_000});
  });
});
