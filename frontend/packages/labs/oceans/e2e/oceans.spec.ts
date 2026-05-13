import {expect, test} from 'playwright/test';

import {AppMode, OceansPage} from './OceansPage';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create an OceansPage bound to the current test's `page`, navigate to the
 * given mode, and wait for the training scene to be ready.
 *
 * @param page    - Playwright Page fixture.
 * @param mode    - App mode to load.
 * @returns Resolved OceansPage at the Training scene.
 */
async function loadTraining(
  page: import('playwright/test').Page,
  mode = AppMode.FishVTrash,
) {
  const oceans = new OceansPage(page);
  await oceans.goto(mode);
  await oceans.waitForTrainingScene();
  return oceans;
}

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Training scene
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — training scene', () => {
  test('loads with training scene and counter at zero', async ({page}) => {
    const oceans = await loadTraining(page);
    await expect(oceans.trainCount).toHaveText('0');
    await expect(oceans.yesButton).toBeVisible();
    await expect(oceans.noButton).toBeVisible();
    await expect(oceans.eraseButton).toBeVisible();
  });

  test('yes button label is "Fish" in fishvtrash mode', async ({page}) => {
    const oceans = await loadTraining(page);
    await expect(oceans.yesButton).toContainText('Fish');
  });

  test('no button label is "Not Fish" in fishvtrash mode', async ({page}) => {
    const oceans = await loadTraining(page);
    await expect(oceans.noButton).toContainText('Not Fish');
  });

  test('yes click increments training count', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.classifyOne(true);
    await expect(oceans.trainCount).toHaveText('1');
  });

  test('no click increments training count', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.classifyOne(false);
    await expect(oceans.trainCount).toHaveText('1');
  });

  test('mixed training updates count correctly', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.train(3, 2);
    await expect(oceans.trainCount).toHaveText('5');
  });

  test('training question contains "fish"', async ({page}) => {
    await loadTraining(page);
    // The training question div has no stable ID; match by visible text.
    await expect(page.getByText('Is this a fish?')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — erase confirmation dialog
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — erase confirmation dialog', () => {
  test('erase button opens confirmation dialog', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.eraseButton.click();
    await expect(oceans.confirmationHeader).toBeVisible();
    await expect(oceans.confirmationHeader).toContainText('Are you sure?');
  });

  test('cancel dismisses dialog without resetting count', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.train(3, 0);
    await oceans.eraseButton.click();
    await oceans.confirmationCancelButton.click();
    await expect(oceans.confirmationHeader).not.toBeVisible();
    await expect(oceans.trainCount).toHaveText('3');
  });

  test('confirm erase resets training count to zero', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.train(3, 0);
    await oceans.eraseButton.click();
    await oceans.confirmationEraseButton.click();
    await expect(oceans.confirmationHeader).not.toBeVisible();
    await expect(oceans.trainCount).toHaveText('0');
  });

  test('erase dialog shows warning text', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.eraseButton.click();
    await expect(page.getByText('Erasing A.I.', {exact: false})).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Predict scene
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — predict scene', () => {
  test('continue from training shows run button', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.advanceToPredictScene();
    await expect(oceans.runButton).toBeVisible();
    await expect(oceans.runButton).toContainText('Run');
  });

  test('run reveals media controls', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.mediaControlsContainer).toBeVisible();
    await expect(oceans.rewindButton).toBeVisible();
    await expect(oceans.fastForwardButton).toBeVisible();
  });

  test('play/pause button starts as Pause after run', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.mediaControlsContainer).toBeVisible();
    // Running: the play/pause shows Pause
    await expect(page.getByRole('button', {name: 'Pause'})).toBeVisible();
  });

  test('play/pause button toggles to Play on click', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    await expect(oceans.mediaControlsContainer).toBeVisible();
    const pauseBtn = page.getByRole('button', {name: 'Pause'});
    await pauseBtn.click();
    await expect(page.getByRole('button', {name: 'Play'})).toBeVisible();
  });

  test('continue button appears after prediction runs', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.advanceToPredictScene();
    await oceans.runButton.click();
    // canSkipPredict triggers after 5 s of run time; allow 15 s total
    await expect(oceans.predictContinueButton).toBeVisible({timeout: 15_000});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishVTrash — Pond scene
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishVTrash — pond scene', () => {
  test('full flow reaches pond with toggle buttons', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto();
    await oceans.waitForTrainingScene();
    await oceans.fullFlow();
    await expect(oceans.toggleMatchingButton).toBeVisible();
    await expect(oceans.toggleNonMatchingButton).toBeVisible();
  });

  test('pond surface has role=button and aria-label', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto();
    await oceans.waitForTrainingScene();
    await oceans.fullFlow();
    await expect(oceans.pondSurface).toHaveAttribute('role', 'button');
    await expect(oceans.pondSurface).toHaveAttribute('aria-label', 'Fish pond');
  });

  test('train more button navigates back to training', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto();
    await oceans.waitForTrainingScene();
    await oceans.fullFlow();
    // canSkipPond triggers after 3 s; trainMoreButton becomes visible then.
    // (#uitest-nav-btns itself has zero height — all children are position:absolute —
    // so we assert on the button directly, not its container.)
    await expect(oceans.trainMoreButton).toBeVisible({timeout: 10_000});
    await oceans.trainMoreButton.click();
    await oceans.waitForTrainingScene();
    await expect(oceans.yesButton).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishShort — Words scene
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishShort — words scene', () => {
  test('shows word-choice buttons before training', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    const count = await oceans.wordButtons.count();
    // FishShort has two columns: colors (3) + shapes (3) = 6 word buttons
    expect(count).toBe(6);
  });

  test('word question prompt is visible', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    await expect(
      page.getByText('What type of fish do you want to train', {exact: false}),
    ).toBeVisible();
  });

  test('clicking a word advances to training scene', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    // Click whichever word appears first (order is shuffled)
    await oceans.wordButtons.first().click();
    await oceans.waitForTrainingScene();
    await expect(oceans.yesButton).toBeVisible();
  });

  test('training question includes the selected word', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    // Click "Blue" specifically (stable label from i18n)
    await page.getByRole('button', {name: 'Blue'}).click();
    await oceans.waitForTrainingScene();
    // Training question: "Is this fish blue?" (lowercase in template)
    await expect(page.getByText('Is this fish blue?')).toBeVisible();
  });

  test('yes button text matches the selected word', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    await page.getByRole('button', {name: 'Blue'}).click();
    await oceans.waitForTrainingScene();
    // Yes button label becomes the word itself (e.g. "Blue")
    await expect(oceans.yesButton).toContainText('Blue');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishShort — Pond info panel
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishShort — pond info panel', () => {
  test('info button visible and has aria-pressed after full flow', async ({
    page,
  }) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    await page.getByRole('button', {name: 'Blue'}).click();
    await oceans.waitForTrainingScene();
    // 1 yes + 1 no satisfies pondFish.length > 0 && recallFish.length > 0
    await oceans.train(1, 1);
    await oceans.fullFlow();
    // Info button only appears in FishShort/FishLong when both fish sets populated
    await expect(oceans.infoButton).toBeVisible({timeout: 10_000});
    await expect(oceans.infoButton).toHaveAttribute('aria-pressed');
  });

  test('info button toggles aria-pressed on click', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    await page.getByRole('button', {name: 'Blue'}).click();
    await oceans.waitForTrainingScene();
    await oceans.train(1, 1);
    await oceans.fullFlow();
    await expect(oceans.infoButton).toBeVisible({timeout: 10_000});
    await expect(oceans.infoButton).toHaveAttribute('aria-pressed', 'false');
    await oceans.infoButton.click();
    await expect(oceans.infoButton).toHaveAttribute('aria-pressed', 'true');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CreaturesVTrashDemo — starts in Predict
// ─────────────────────────────────────────────────────────────────────────────

test.describe('CreaturesVTrashDemo mode', () => {
  test('loads directly in predict scene with run button', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.CreaturesVTrashDemo);
    await oceans.waitForPredictScene();
    await expect(oceans.runButton).toBeVisible();
    // No training was required — should not see training buttons
    await expect(oceans.yesButton).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test('erase button has descriptive aria-label', async ({page}) => {
    const oceans = await loadTraining(page);
    // I18n.t('erase') = "Erase" (capital E per oceans.json)
    await expect(oceans.eraseButton).toHaveAttribute('aria-label', 'Erase');
  });

  test('pond toggle buttons have descriptive aria-labels', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto();
    await oceans.waitForTrainingScene();
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
    const oceans = await loadTraining(page);
    // Programmatic focus (the DemoShell mode-picker sits above the lab in
    // tab order, so Tab alone would hit a radio first).
    await oceans.yesButton.focus();
    const yesClass = await page.evaluate(
      () => document.activeElement?.className ?? '',
    );
    expect(yesClass).toContain('ocean-train-btn-yes');

    await oceans.noButton.focus();
    const noClass = await page.evaluate(
      () => document.activeElement?.className ?? '',
    );
    expect(noClass).toContain('ocean-train-btn-no');
  });

  test('yes button is activatable by keyboard Enter', async ({page}) => {
    const oceans = await loadTraining(page);
    await oceans.yesButton.focus();
    await page.keyboard.press('Enter');
    await expect(oceans.trainCount).toHaveText('1');
  });

  test('erase button has type=button (no accidental form submit)', async ({
    page,
  }) => {
    const oceans = await loadTraining(page);
    // All buttons in the ocean UI should be type=button, not type=submit
    const eraseType = await oceans.eraseButton.getAttribute('type');
    expect(eraseType).toBe('button');
  });

  test('media control buttons have explicit aria-labels', async ({page}) => {
    const oceans = await loadTraining(page);
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
    await loadTraining(page);
    // All SVG icons inside training buttons should have aria-hidden
    const svgCount = await page
      .locator('.ocean-train-btn-yes svg, .ocean-train-btn-no svg')
      .count();
    const hiddenCount = await page
      .locator(
        '.ocean-train-btn-yes svg[aria-hidden], .ocean-train-btn-no svg[aria-hidden]',
      )
      .count();
    expect(hiddenCount).toBe(svgCount);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DemoShell mode picker
// ─────────────────────────────────────────────────────────────────────────────

test.describe('DemoShell mode picker', () => {
  test('renders all five modes', async ({page}) => {
    await page.goto('/?guide=off');
    const labels = [
      'Fish vs Trash',
      'Fish Short',
      'Fish Long',
      'Creatures vs Trash',
      'Creatures Demo',
    ];
    for (const label of labels) {
      await expect(page.getByRole('radio', {name: label})).toBeVisible();
    }
  });

  test('FishVTrash is selected by default', async ({page}) => {
    await page.goto('/?guide=off');
    await expect(
      page.getByRole('radio', {name: 'Fish vs Trash'}),
    ).toBeChecked();
  });

  test('URL param ?mode=short selects Fish Short radio', async ({page}) => {
    await page.goto('/?guide=off&mode=short');
    await expect(page.getByRole('radio', {name: 'Fish Short'})).toBeChecked();
  });

  test('switching to Fish Short mode shows words scene', async ({page}) => {
    await page.goto('/?guide=off');
    await page.getByRole('radio', {name: 'Fish Short'}).click();
    const oceans = new OceansPage(page);
    await oceans.waitForWordsScene();
    await expect(oceans.wordButtons.first()).toBeVisible();
  });

  test('switching to Creatures Demo mode shows predict scene', async ({
    page,
  }) => {
    await page.goto('/?guide=off');
    const oceans = new OceansPage(page);
    // Wait for FishVTrash to fully initialize before switching — ensures the
    // TFJS model load completes so the mode switch triggers a single initAll.
    await oceans.waitForTrainingScene();
    await page.getByRole('radio', {name: 'Creatures Demo'}).click();
    await oceans.waitForPredictScene();
    await expect(oceans.runButton).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// No critical console errors
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Console health', () => {
  test('no model-loading errors on startup', async ({page}) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('model.json')) {
        errors.push(msg.text());
      }
    });
    const oceans = await loadTraining(page);
    // Training scene visible means model loaded successfully
    await expect(oceans.yesButton).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('no unhandled JS errors on page load', async ({page}) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', err => pageErrors.push(err));
    const oceans = new OceansPage(page);
    await oceans.goto();
    await oceans.waitForTrainingScene();
    expect(pageErrors).toHaveLength(0);
  });
});
