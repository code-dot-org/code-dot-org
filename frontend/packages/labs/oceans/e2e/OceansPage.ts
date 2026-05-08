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
 * Base Page Object for the AI for Oceans standalone dev server.
 *
 * Contains shared locators and navigation helpers for all modes. Mode-specific
 * training interactions (yes/no buttons, classifyOne, train, fullFlow) live in
 * the concrete subclasses {@link FishVTrashPage} and {@link FishShortPage}.
 *
 * All `goto` calls append `?guide=off` to suppress guide overlays.
 */
export class OceansPage {
  constructor(readonly page: Page) {}

  /**
   * Locate any button by its accessible name.
   *
   * @param label - Exact string or regex matched against the button's accessible name.
   */
  getButton(label: string | RegExp): Locator {
    return this.page.getByRole('button', {name: label});
  }

  // ── Training scene ──────────────────────────────────────────────────

  /** Counter span showing total classifications so far. */
  get trainCount(): Locator {
    return this.page.locator('#uitest-train-count');
  }

  /** Erase button — also the sentinel for "training scene is visible". */
  get eraseButton(): Locator {
    return this.getButton('Erase');
  }

  /** Continue button that advances Training → Predicting. */
  get trainingContinueButton(): Locator {
    return this.page.getByRole('button', {name: 'Continue'});
  }

  // ── Words scene (FishShort / FishLong) ──────────────────────────────

  /** All word-choice buttons rendered in the Words scene. */
  get wordButtons(): Locator {
    return this.page.locator('.words-button');
  }

  // ── Predict scene ───────────────────────────────────────────────────

  /** Run button that starts prediction. */
  get runButton(): Locator {
    return this.page.locator('#uitest-run-btn');
  }

  /** Container div holding the three media-control buttons. */
  get mediaControlsContainer(): Locator {
    return this.page.locator('#uitest-media-ctrl');
  }

  /** Rewind media control. */
  get rewindButton(): Locator {
    return this.getButton('Rewind');
  }

  /**
   * Play / Pause media control.
   * Label alternates between "Pause" (while running) and "Play" (while paused).
   */
  get playPauseButton(): Locator {
    return this.page.getByRole('button', {name: /^(Pause|Play)$/});
  }

  /** Fast-forward media control. */
  get fastForwardButton(): Locator {
    return this.getButton('Fast forward');
  }

  /** Continue button in Predict scene (appears after canSkipPredict). */
  get predictContinueButton(): Locator {
    return this.page.locator('#uitest-continue-btn');
  }

  // ── Pond scene ──────────────────────────────────────────────────────

  /** Clickable fish-pond surface (role=button). */
  get pondSurface(): Locator {
    return this.page.getByRole('button', {name: 'Fish pond'});
  }

  /** Toggle button that switches to the matching (classified) fish set. */
  get toggleMatchingButton(): Locator {
    return this.page.getByRole('button', {name: 'Switch to Matching Items'});
  }

  /** Toggle button that switches to the non-matching fish set. */
  get toggleNonMatchingButton(): Locator {
    return this.page.getByRole('button', {
      name: 'Switch to Non-Matching Items',
    });
  }

  /**
   * Info-panel toggle button (FishShort / FishLong only).
   * Has `aria-pressed` reflecting open/closed state.
   */
  get infoButton(): Locator {
    return this.page.locator('#uitest-info-btn');
  }

  /** Train More button that returns to the Training scene. */
  get trainMoreButton(): Locator {
    return this.page.getByRole('button', {name: 'Train More'});
  }

  /** Continue button inside the pond nav-buttons container. */
  get pondContinueButton(): Locator {
    return this.page
      .locator('#uitest-nav-btns')
      .getByRole('button', {name: 'Continue'});
  }

  // ── Confirmation dialog ─────────────────────────────────────────────

  /** Header text of the erase-confirmation dialog ("Are you sure?"). */
  get confirmationHeader(): Locator {
    return this.page.locator('.confirmation-text');
  }

  /** Erase confirm button inside the confirmation dialog. */
  get confirmationEraseButton(): Locator {
    return this.page.locator('.dialog-button', {hasText: 'Erase'});
  }

  /** Cancel button inside the confirmation dialog. */
  get confirmationCancelButton(): Locator {
    return this.page.locator('.dialog-button', {hasText: 'Cancel'});
  }

  // ── Navigation ──────────────────────────────────────────────────────

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
   * Wait until the Training scene is fully visible.
   * Uses the Erase button as the sentinel — it is only rendered in the training scene.
   */
  async waitForTrainingScene(): Promise<void> {
    await this.eraseButton.waitFor({state: 'visible', timeout: 10_000});
  }

  /** Wait until the Words scene is visible (FishShort / FishLong modes). */
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

  /** Wait until the Pond scene is visible (fish-pond surface rendered). */
  async waitForPondScene(): Promise<void> {
    await this.pondSurface.waitFor({state: 'visible', timeout: 10_000});
  }

  /**
   * Advance from Training to Predicting by clicking Continue,
   * then wait for the Run button to appear.
   */
  async advanceToPredictScene(): Promise<void> {
    await this.trainingContinueButton.click();
    await this.waitForPredictScene();
  }

  /**
   * Start prediction and wait until the Continue button is available
   * (canSkipPredict becomes true after the prediction animation runs).
   *
   * @param timeout - Max ms to wait for the Continue button; defaults to 15 s.
   */
  async runPrediction(timeout = 15_000): Promise<void> {
    await this.runButton.click();
    await this.predictContinueButton.waitFor({state: 'visible', timeout});
  }
}

/**
 * Base for modes that include the Training scene.
 *
 * Subclasses supply the mode-specific yes/no button locators; this class
 * provides `classifyOne`, `train`, and `fullFlow` built on top of them.
 */
export abstract class TrainingPage extends OceansPage {
  /** Positive-answer training button (label depends on mode / selected word). */
  abstract get yesButton(): Locator;

  /** Negative-answer training button (label depends on mode / selected word). */
  abstract get noButton(): Locator;

  /**
   * Click Yes (or No) once and wait until the training counter increments.
   *
   * `onClassifyFish` increments the count synchronously but also sets
   * `isRunning: true`. While `isRunning` is true (~1 s fish-eat animation)
   * subsequent clicks are silently ignored. This method retries the click until
   * the counter advances, so callers never need to manage animation timing.
   *
   * @param isYes - `true` to click Yes, `false` to click No.
   */
  async classifyOne(isYes: boolean): Promise<void> {
    const currentText = (await this.trainCount.textContent()) ?? '0';
    const count = parseInt(currentText.trim(), 10);
    const next = Math.min(999, count + 1);

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
   * Complete the Training → Predicting → Pond flow.
   *
   * Trains `yesCount` yes + `noCount` no examples (default: 0 each), then
   * runs prediction and advances to the Pond scene.
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

/**
 * Page object for FishVTrash mode.
 *
 * Yes button label: "Fish". No button label: "Not Fish".
 */
export class FishVTrashPage extends TrainingPage {
  /** "Fish" button — exact match so it doesn't also resolve "Not Fish". */
  get yesButton(): Locator {
    return this.page.getByRole('button', {name: 'Fish', exact: true});
  }

  get noButton(): Locator {
    return this.getButton('Not Fish');
  }

  /**
   * Navigate to FishVTrash and wait for the training scene.
   *
   * @param page - Playwright Page fixture.
   */
  static async load(page: Page): Promise<FishVTrashPage> {
    const p = new FishVTrashPage(page);
    await p.goto(AppMode.FishVTrash);
    await p.waitForTrainingScene();
    return p;
  }
}

/**
 * Page object for FishShort (and FishLong) mode after a word has been selected.
 *
 * Yes button label: the selected word. No button label: "Not <word>".
 */
export class FishShortPage extends TrainingPage {
  /**
   * @param page - Playwright Page fixture.
   * @param word - The word selected in the Words scene (e.g. "Blue").
   */
  constructor(
    page: Page,
    readonly word: string,
  ) {
    super(page);
  }

  /** Yes button — exact match so it doesn't also resolve "Not <word>". */
  get yesButton(): Locator {
    return this.page.getByRole('button', {name: this.word, exact: true});
  }

  get noButton(): Locator {
    return this.getButton(`Not ${this.word}`);
  }

  /**
   * Navigate to FishShort, wait for the Words scene, click the given word,
   * then wait for the Training scene.
   *
   * @param page - Playwright Page fixture.
   * @param word - Word label to select (e.g. "Blue").
   */
  static async load(page: Page, word: string): Promise<FishShortPage> {
    const p = new FishShortPage(page, word);
    await p.goto(AppMode.FishShort);
    await p.waitForWordsScene();
    await p.getButton(word).click();
    await p.waitForTrainingScene();
    return p;
  }
}
