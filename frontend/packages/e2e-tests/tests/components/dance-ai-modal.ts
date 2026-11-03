import {expect, type Locator, type Page} from '@playwright/test';

/**
 * The AI effect-generator modal (apps/src/dance/ai/DanceAiModal.tsx), opened
 * by clicking a Dancelab_ai block's editable field. Its outer container
 * (#ai-modal-header-area) mounts almost immediately, but the emoji picker and
 * the Generate control render ~500ms later — wait on those, not the
 * container (see waitForEmojiPicker).
 */
export class DanceAiModalComponent {
  /**
   * CSS: the only stable way to scope this dialog apart from a second,
   * unrelated OneTrust cookie-preference-center [role="dialog"] that can
   * also be in the DOM — neither carries a distinguishing id or class.
   */
  readonly modalSelector = '[role="dialog"]:has(#ai-modal-header-area)';

  readonly root: Locator;

  /** CSS: a plain div with no accessible role or name (a11y gap). */
  readonly headerArea: Locator;

  readonly closeButton: Locator;

  /**
   * Anchor for "the emoji picker has mounted". Stable across the initial
   * open and every later Start Over, unlike any single emoji button (which
   * does not exist yet on first mount).
   */
  readonly chooseEmojisHint: Locator;

  /**
   * CSS by id: measured a11y snapshot of this dialog (generate/use/
   * regenerate/start-over/toggle-code/toggle-effect/explanation/
   * leave-explanation/convert) shows none of these buttons ever reachable by
   * role — despite rendering as real DOM <button> elements
   * (legacySharedComponents/Button.jsx, SegmentedButtons), they never surface
   * with an ARIA role in the accessibility tree at any modal state. Fall back
   * to the same id the Cucumber step presses.
   */
  readonly generateButton: Locator;

  readonly useButton: Locator;

  readonly regenerateButton: Locator;

  readonly startOverButton: Locator;

  readonly toggleCodeButton: Locator;

  readonly toggleEffectButton: Locator;

  readonly explanationButton: Locator;

  readonly leaveExplanationButton: Locator;

  readonly convertButton: Locator;

  /** CSS: renders a non-textual, graphical comparison — no accessible role or text (a11y gap). */
  readonly explanationArea: Locator;

  constructor(page: Page) {
    this.root = page.locator(this.modalSelector);
    this.headerArea = this.root.locator('#ai-modal-header-area');
    this.closeButton = this.root.getByRole('button', {name: 'Close'});
    this.chooseEmojisHint = this.root.getByText('Choose three emojis.');
    this.generateButton = this.root.locator('#generate-button');
    this.useButton = this.root.locator('#use-button');
    this.regenerateButton = this.root.locator('#regenerate-button');
    this.startOverButton = this.root.locator('#start-over-button');
    this.toggleCodeButton = this.root.locator('#toggle-code-button');
    this.toggleEffectButton = this.root.locator('#toggle-effect-button');
    this.explanationButton = this.root.locator('#explanation-button');
    this.leaveExplanationButton = this.root.locator(
      '#leave-explanation-button',
    );
    this.convertButton = this.root.locator('#convert-button');
    this.explanationArea = page.locator('#explanation-area');
  }

  /**
   * A single emoji-picker button, by its emoji. Confirmed by the measured
   * a11y snapshot: each of the 26 palette buttons is individually named by
   * its emoji via aria-label, and stays reachable across every modal state.
   * exact: true guards against one emoji's name being a substring of another.
   */
  private emojiButton(emoji: string): Locator {
    return this.root.getByRole('button', {name: emoji, exact: true});
  }

  /**
   * Wait for the emoji picker to mount. The modal container becoming
   * visible does not imply it is interactive; the picker (and Generate)
   * render on their own ~500ms after the container does.
   */
  async waitForEmojiPicker(): Promise<void> {
    await expect(this.chooseEmojisHint).toBeVisible();
  }

  async selectEmoji(emoji: string): Promise<void> {
    await this.emojiButton(emoji).click();
  }

  async generate(): Promise<void> {
    await this.generateButton.click();
  }

  /**
   * Wait for the GENERATING -> GENERATED -> RESULTS animation to finish.
   * Backed by a fixed client-side timer (~10.7s observed), not any request.
   */
  async waitForResults(): Promise<void> {
    await expect(this.useButton).toBeVisible({timeout: 20_000});
  }

  async toggleCode(): Promise<void> {
    await this.toggleCodeButton.click();
  }

  async toggleEffect(): Promise<void> {
    await this.toggleEffectButton.click();
  }

  async openExplanation(): Promise<void> {
    await this.explanationButton.click();
    await expect(this.explanationArea).toBeVisible();
  }

  async leaveExplanation(): Promise<void> {
    await this.leaveExplanationButton.click();
    await expect(this.explanationArea).toBeHidden();
  }

  async regenerate(): Promise<void> {
    await this.regenerateButton.click();
  }

  async startOver(): Promise<void> {
    await this.startOverButton.click();
  }

  /** Apply the generated effect to the source block's field and close the modal. */
  async use(): Promise<void> {
    await this.useButton.click();
    await expect(this.headerArea).toBeHidden();
  }

  /** Splice the generated code's blocks into the workspace and close the modal. */
  async convert(): Promise<void> {
    await this.convertButton.click();
    await expect(this.headerArea).toBeHidden();
  }
}
