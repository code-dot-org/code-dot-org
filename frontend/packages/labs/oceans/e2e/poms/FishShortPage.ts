import {type Locator, type Page} from 'playwright/test';

import {AppMode} from './OceansPage';
import {TrainingPage} from './TrainingPage';

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

  protected override get appMode() {
    return AppMode.FishShort;
  }

  /** Yes button — exact match so it doesn't also resolve "Not <word>". */
  get yesButton(): Locator {
    return this.page.getByRole('button', {name: this.word, exact: true});
  }

  get noButton(): Locator {
    return this.getButton(`Not ${this.word}`);
  }

  protected override async waitForReady(): Promise<void> {
    await this.waitForWordsScene();
    await this.getButton(this.word).click();
    await this.waitForTrainingScene();
  }

  /**
   * Convenience: `new FishShortPage(page, word).load(opts)`.
   *
   * @param page - Playwright Page fixture.
   * @param word - Word label to select (e.g. "Blue").
   * @param opts - Forwarded to {@link load}.
   */
  static load(
    page: Page,
    word: string,
    opts: {freeze?: boolean} = {},
  ): Promise<FishShortPage> {
    return new FishShortPage(page, word).load(opts);
  }
}
