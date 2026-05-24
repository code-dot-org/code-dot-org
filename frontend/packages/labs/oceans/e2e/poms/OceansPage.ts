import {expect, type Locator, type Page} from 'playwright/test';

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

  /* Training scene */

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

  /* Words scene (FishShort / FishLong) */

  /** All word-choice buttons rendered in the Words scene. */
  get wordButtons(): Locator {
    return this.page.getByTestId('word-button');
  }

  /* Predict scene */

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

  /* Pond scene */

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

  /* Guide overlay */

  /**
   * Clickable guide overlay (covers the whole scene).
   * Dismisses modal guides on click.  Only present while a guide is showing.
   */
  get guideOverlay(): Locator {
    return this.page.locator('#uitest-dismiss-guide');
  }

  /**
   * The guide dialog element.  Receives programmatic focus (tabIndex=-1) when
   * a modal guide appears; Space/Enter dismiss the guide from this element.
   * aria-label holds the guide text; aria-modal=true for modal guides.
   */
  get guideDialog(): Locator {
    return this.page.locator('dialog.guide-dialog');
  }

  /**
   * Press Enter on each queued guide dialog until the overlay closes.
   * A 30 s wall-clock cap stops a wedged Typist animation from compounding
   * per-iteration timeouts into a multi-minute hang.
   *
   * @param maxGuides - Safety cap to avoid infinite loops.
   */
  async dismissAllGuides(maxGuides = 10): Promise<void> {
    const appeared = await this.guideOverlay
      .waitFor({state: 'visible', timeout: 15_000})
      .then(() => true)
      .catch(() => false);
    if (!appeared) return;

    const deadline = Date.now() + 30_000;
    for (let i = 0; i < maxGuides; i++) {
      if (!(await this.guideOverlay.isVisible().catch(() => false))) break;
      const remaining = deadline - Date.now();
      const iterTimeout =
        i === 0 ? 20_000 : Math.max(2_000, Math.min(20_000, remaining));
      const labelBefore = await this.guideDialog
        .getAttribute('aria-label')
        .catch(() => null);
      // Enter is a no-op while Typist animates; retry press+check until it lands.
      await expect(async () => {
        if (!(await this.guideOverlay.isVisible())) return;
        await this.guideDialog.press('Enter');
        if (!(await this.guideOverlay.isVisible())) return;
        const label = await this.guideDialog
          .getAttribute('aria-label')
          .catch(() => null);
        expect(label).not.toBe(labelBefore);
      }).toPass({timeout: iterTimeout});
      if (Date.now() >= deadline) break;
    }
  }

  /* Confirmation dialog */

  /**
   * Erase-confirmation dialog, scoped by name; an unscoped match collides
   * with Guide's dialog.
   */
  get confirmationDialog(): Locator {
    return this.page.getByRole('dialog', {name: 'Are you sure?'});
  }

  /** Heading element inside the erase-confirmation dialog ("Are you sure?"). */
  get confirmationHeader(): Locator {
    return this.confirmationDialog.getByRole('heading', {
      name: 'Are you sure?',
    });
  }

  /** Erase confirm button inside the confirmation dialog. */
  get confirmationEraseButton(): Locator {
    return this.confirmationDialog.getByRole('button', {name: 'Erase'});
  }

  /** Cancel button inside the confirmation dialog. */
  get confirmationCancelButton(): Locator {
    return this.confirmationDialog.getByRole('button', {name: 'Cancel'});
  }

  /* Navigation */

  /** The app mode this page expects. Subclasses override. */
  protected get appMode(): AppModeValue {
    return AppMode.FishVTrash;
  }

  /**
   * Navigate to the standalone dev server for the given mode.
   *
   * By default appends `?guide=off` to suppress guide overlays.
   * Pass `guides: 'K5'` (or another variant) to load with guides enabled
   * instead — useful for testing guide keyboard-dismissal flows.
   *
   * @param mode - App mode to load; defaults to FishVTrash.
   * @param opts - Optional freeze/guides flags.
   */
  async goto(
    mode: AppModeValue = AppMode.FishVTrash,
    opts: {freeze?: boolean; guides?: string} = {},
  ): Promise<void> {
    const params = new URLSearchParams({mode});
    if (opts.guides) {
      params.set('guides', opts.guides);
    } else {
      params.set('guide', 'off');
    }
    if (opts.freeze) {
      params.set('testFreeze', '1');
    }
    await this.page.goto(`/?${params.toString()}`);
  }

  /**
   * Navigate to `appMode` and wait for the page to be ready. Subclasses
   * override {@link waitForReady} with their own readiness check; subclass
   * static `load` helpers just construct + delegate here.
   *
   * @param opts - Optional freeze flag for visual-regression callers.
   * @returns `this` for chaining.
   */
  async load(opts: {freeze?: boolean} = {}): Promise<this> {
    await this.goto(this.appMode, opts);
    await this.waitForReady();
    return this;
  }

  /**
   * Subclass hook called by {@link load} after navigation. Default no-op;
   * override to wait for a mode-specific sentinel (e.g. training scene),
   * dismiss intro UI, etc.
   */
  protected async waitForReady(): Promise<void> {}

  /**
   * Wait until the Training scene is fully visible.
   * Uses the Erase button as the sentinel — it is only rendered in the training scene.
   */
  async waitForTrainingScene(): Promise<void> {
    await this.eraseButton.waitFor({state: 'visible', timeout: 30_000});
  }

  /** Wait until the Words scene is visible (FishShort / FishLong modes). */
  async waitForWordsScene(): Promise<void> {
    await this.wordButtons.first().waitFor({state: 'visible', timeout: 30_000});
  }

  /**
   * Wait until the Predict scene is visible (Run button rendered).
   *
   * @param timeout - Max ms to wait; defaults to 30 s to absorb the
   *   IntermediateLoading phase and webkit's slower asset/model load.
   */
  async waitForPredictScene(timeout = 30_000): Promise<void> {
    await this.runButton.waitFor({state: 'visible', timeout});
  }

  /** Wait until the Pond scene is visible (fish-pond surface rendered). */
  async waitForPondScene(): Promise<void> {
    await this.pondSurface.waitFor({state: 'visible', timeout: 30_000});
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
   * Wait until the Continue button appears in the Predict scene
   * (canSkipPredict becomes true after the prediction animation completes).
   */
  async waitForPredictComplete(timeout = 30_000): Promise<void> {
    await this.predictContinueButton.waitFor({state: 'visible', timeout});
  }

  /** Click the Run button then wait for the Continue button to appear. */
  async runPrediction(): Promise<void> {
    await this.runButton.click();
    await this.waitForPredictComplete();
  }

  /**
   * Focus `locator` and press Enter at the page level — same path AT takes,
   * and avoids locator.press()'s second stability check dropping events on CI.
   *
   * @param locator - The control to focus and activate.
   */
  async pressEnter(locator: Locator): Promise<void> {
    await locator.focus();
    await expect(locator).toBeFocused();
    await this.page.keyboard.press('Enter');
  }
}
