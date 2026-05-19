import {type Locator, type Page} from 'playwright/test';

import {AppMode} from './OceansPage';
import {TrainingPage} from './TrainingPage';

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
