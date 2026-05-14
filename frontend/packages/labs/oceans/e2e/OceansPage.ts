import {type Locator, type Page, expect} from 'playwright/test';

/** App mode values mirrored from `src/oceans/constants.ts`. */
export const AppMode = {
  FishVTrash: 'fishvtrash',
  FishShort: 'short',
  FishLong: 'long',
  CreaturesVTrash: 'creaturesvtrash',
  CreaturesVTrashDemo: 'creaturesvtrashdemo',
} as const;

/** Valid app mode strings. */
export type AppModeValue = (typeof AppMode)[keyof typeof AppMode];

/**
 * Page Object for the AI for Oceans standalone dev server.
 *
 * Wraps all scene-specific locators and common navigation/interaction helpers.
 * All `goto` calls append `?guide=off` so that guide overlays never block
 * test interactions; tests that explicitly exercise guide behaviour should
 * construct the URL manually via `page.goto`.
 */
export class OceansPage {
  readonly page: Page;

  // ── Training scene ──────────────────────────────────────────────────
  /** Yes / "Fish" / word-label button. */
  readonly yesButton: Locator;
  /** No / "Not Fish" / "Not [word]" button. */
  readonly noButton: Locator;
  /** Counter span showing total classifications so far. */
  readonly trainCount: Locator;
  /** Erase (reset) button — opens the confirmation dialog. */
  readonly eraseButton: Locator;
  /** "Continue" button that advances Training → Predicting. */
  readonly trainingContinueButton: Locator;

  // ── Words scene (FishShort / FishLong) ──────────────────────────────
  /** All word-choice buttons rendered in the Words scene. */
  readonly wordButtons: Locator;

  // ── Predict scene ───────────────────────────────────────────────────
  /** "Run" button that starts prediction. */
  readonly runButton: Locator;
  /** Container div holding the three media-control buttons. */
  readonly mediaControlsContainer: Locator;
  /** Rewind media control. */
  readonly rewindButton: Locator;
  /**
   * Play / Pause media control.
   * Label alternates between "Pause" (while running) and "Play" (while paused).
   */
  readonly playPauseButton: Locator;
  /** Fast-forward media control. */
  readonly fastForwardButton: Locator;
  /** "Continue" button that appears in Predict scene after canSkipPredict. */
  readonly predictContinueButton: Locator;

  // ── Pond scene ──────────────────────────────────────────────────────
  /** Clickable fish-pond surface (role=button). */
  readonly pondSurface: Locator;
  /** Toggle icon that switches to the matching (classified) fish set. */
  readonly toggleMatchingButton: Locator;
  /** Toggle icon that switches to the non-matching fish set. */
  readonly toggleNonMatchingButton: Locator;
  /**
   * Info-panel toggle button (FishShort / FishLong only).
   * Has `aria-pressed` reflecting open/closed state.
   */
  readonly infoButton: Locator;
  /** "Train More" button that returns to the Training scene. */
  readonly trainMoreButton: Locator;
  /** "Continue" button inside the pond nav-buttons container. */
  readonly pondContinueButton: Locator;

  // ── Confirmation dialog ─────────────────────────────────────────────
  /** Header text of the erase-confirmation dialog ("Are you sure?"). */
  readonly confirmationHeader: Locator;
  /** "Erase" confirm button inside the dialog. */
  readonly confirmationEraseButton: Locator;
  /** "Cancel" button inside the dialog. */
  readonly confirmationCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.yesButton = page.locator('.ocean-train-btn-yes');
    this.noButton = page.locator('.ocean-train-btn-no');
    this.trainCount = page.locator('#uitest-train-count');
    this.eraseButton = page.locator('.ocean-erase-btn');
    this.trainingContinueButton = page.getByRole('button', {name: 'Continue'});

    this.wordButtons = page.locator('.ocean-word-btn');

    this.runButton = page.locator('#uitest-run-btn');
    this.mediaControlsContainer = page.locator('#uitest-media-ctrl');
    this.rewindButton = page.getByRole('button', {name: 'Rewind'});
    this.playPauseButton = page.getByRole('button', {name: /^(Pause|Play)$/});
    this.fastForwardButton = page.getByRole('button', {name: 'Fast forward'});
    this.predictContinueButton = page.locator('#uitest-continue-btn');

    this.pondSurface = page.getByRole('button', {name: 'Fish pond'});
    this.toggleMatchingButton = page.getByRole('button', {
      name: 'Switch to Matching Items',
    });
    this.toggleNonMatchingButton = page.getByRole('button', {
      name: 'Switch to Non-Matching Items',
    });
    this.infoButton = page.locator('#uitest-info-btn');
    this.trainMoreButton = page.getByRole('button', {name: 'Train More'});
    this.pondContinueButton = page
      .locator('#uitest-nav-btns')
      .getByRole('button', {name: 'Continue'});

    this.confirmationHeader = page.locator('.confirmation-text');
    this.confirmationEraseButton = page.locator('.dialog-button', {
      hasText: 'Erase',
    });
    this.confirmationCancelButton = page.locator('.dialog-button', {
      hasText: 'Cancel',
    });
  }

  /**
   * Navigate to the standalone dev server for the given app mode.
   *
   * Always appends `?guide=off` to suppress guide overlays, keeping tests
   * deterministic without guide-dismissal boilerplate.
   *
   * @param mode - App mode to load; defaults to FishVTrash.
   */
  async goto(mode: AppModeValue = AppMode.FishVTrash): Promise<void> {
    const params = new URLSearchParams({guide: 'off', mode});
    await this.page.goto(`/?${params.toString()}`);
  }

  /**
   * Wait until the Training scene is fully visible (loading screen gone,
   * Yes/No buttons rendered and not obscured).
   */
  async waitForTrainingScene(): Promise<void> {
    await this.yesButton.waitFor({state: 'visible', timeout: 10_000});
  }

  /**
   * Wait until the Words scene is visible (FishShort / FishLong modes).
   */
  async waitForWordsScene(): Promise<void> {
    await this.wordButtons.first().waitFor({state: 'visible', timeout: 10_000});
  }

  /**
   * Wait until the Predict scene is visible (Run button rendered).
   *
   * @param timeout - Max ms to wait; defaults to 15 s to absorb
   *   the IntermediateLoading phase that precedes Predicting mode.
   */
  async waitForPredictScene(timeout = 15_000): Promise<void> {
    await this.runButton.waitFor({state: 'visible', timeout});
  }

  /**
   * Wait until the Pond scene is visible (fish-pond surface rendered).
   */
  async waitForPondScene(): Promise<void> {
    await this.pondSurface.waitFor({state: 'visible', timeout: 10_000});
  }

  /**
   * Click Yes (or No) once and wait until the training counter increments.
   *
   * `onClassifyFish` increments `yesCount`/`noCount` synchronously but also
   * sets `isRunning: true`. While `isRunning` is true (~1 s fish-eat animation)
   * subsequent clicks are silently ignored. This method retries the click until
   * the counter advances, so callers never need to manage animation timing.
   *
   * @param isYes - `true` to click Yes, `false` to click No.
   */
  async classifyOne(isYes: boolean): Promise<void> {
    const currentText = (await this.trainCount.textContent()) ?? '0';
    const count = parseInt(currentText.trim(), 10);
    const next = Math.min(999, count + 1);

    // Retry: click the button, then assert count reached `next` within 1.2 s
    // (one animation cycle). If the click was a no-op (isRunning still true),
    // toPass retries automatically until the 5 s outer timeout.
    await expect(async () => {
      if (isYes) {
        await this.yesButton.click();
      } else {
        await this.noButton.click();
      }
      await expect(this.trainCount).toHaveText(String(next), {timeout: 1_200});
    }).toPass({timeout: 5_000});
  }

  /**
   * Perform a training sequence of yes-clicks followed by no-clicks.
   *
   * @param yesCount - Number of Yes classifications to submit.
   * @param noCount  - Number of No classifications to submit.
   */
  async train(yesCount: number, noCount: number): Promise<void> {
    for (let i = 0; i < yesCount; i++) {
      await this.classifyOne(true);
    }
    for (let i = 0; i < noCount; i++) {
      await this.classifyOne(false);
    }
  }

  /**
   * Advance from Training to Predicting by clicking the Continue button,
   * then wait for the Run button to appear.
   */
  async advanceToPredictScene(): Promise<void> {
    await this.trainingContinueButton.click();
    await this.waitForPredictScene();
  }

  /**
   * Start prediction and wait until the Continue button is available
   * (canSkipPredict becomes true after ~5 s).
   *
   * @param timeout - Maximum ms to wait for the Continue button; defaults to 15 s.
   */
  async runPrediction(timeout = 15_000): Promise<void> {
    await this.runButton.click();
    await this.predictContinueButton.waitFor({state: 'visible', timeout});
  }

  /**
   * Complete the full Training → Predicting → Pond flow.
   *
   * Trains `yesCount` yes + `noCount` no examples, then runs prediction and
   * advances to the Pond scene.
   *
   * @param yesCount - Yes classifications to submit before advancing.
   * @param noCount  - No classifications to submit before advancing.
   */
  async fullFlow(yesCount = 0, noCount = 0): Promise<void> {
    await this.train(yesCount, noCount);
    await this.advanceToPredictScene();
    await this.runPrediction();
    await this.predictContinueButton.click();
    await this.waitForPondScene();
  }
}
