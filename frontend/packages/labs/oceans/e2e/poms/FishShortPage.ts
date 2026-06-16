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
