import {type Locator, type Page} from 'playwright/test';

/**
 * Page Object for the markdown demo shell (demo/Demo.tsx): a scenario picker on
 * the left, a dark-mode toggle, and the previewed render on the right.
 */
export class DemoPage {
  /** The previewed scenario render; carries the `data-theme` attribute. */
  readonly preview: Locator;

  constructor(readonly page: Page) {
    this.preview = page.getByTestId('scenario');
  }

  /** Radio that selects a scenario by its visible name. */
  scenarioRadio(name: string): Locator {
    return this.page.getByRole('radio', {name});
  }

  /** The Light/Dark theme toggle. */
  get darkModeToggle(): Locator {
    return this.page.getByRole('checkbox', {name: 'Dark mode'});
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Select a scenario by name. */
  async selectScenario(name: string): Promise<void> {
    await this.scenarioRadio(name).check();
  }

  /** Turn dark mode on or off. */
  async setDarkMode(on: boolean): Promise<void> {
    await this.darkModeToggle.setChecked(on);
  }

  /**
   * Navigate and wait for the preview to render.
   *
   * @returns Loaded DemoPage instance.
   */
  static async load(page: Page): Promise<DemoPage> {
    const demo = new DemoPage(page);
    await demo.goto();
    await demo.preview.waitFor({state: 'visible', timeout: 10_000});
    return demo;
  }
}
