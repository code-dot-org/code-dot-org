import {type Locator, type Page} from 'playwright/test';

import {AppMode} from './OceansPage';
import {TrainingPage} from './TrainingPage';

/**
 * Page object for FishVTrash mode.
 *
 * Yes button label: "Fish". No button label: "Not Fish".
 */
export class FishVTrashPage extends TrainingPage {
  protected override get appMode() {
    return AppMode.FishVTrash;
  }

  /** "Fish" button — exact match so it doesn't also resolve "Not Fish". */
  get yesButton(): Locator {
    return this.page.getByRole('button', {name: 'Fish', exact: true});
  }

  get noButton(): Locator {
    return this.getButton('Not Fish');
  }

  protected override async waitForReady(): Promise<void> {
    await this.waitForTrainingScene();
  }

  /**
   * Convenience: `new FishVTrashPage(page).load(opts)`.
   *
   * @param page - Playwright Page fixture.
   * @param opts - Forwarded to {@link load}.
   */
  static load(
    page: Page,
    opts: {freeze?: boolean} = {},
  ): Promise<FishVTrashPage> {
    return new FishVTrashPage(page).load(opts);
  }
}
