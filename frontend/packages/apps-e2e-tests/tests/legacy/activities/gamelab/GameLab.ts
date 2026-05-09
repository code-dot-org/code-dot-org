import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for Game Lab — p5.js + Blockly CSF activity.
 *
 * Uses allthethingscourse lesson 19.
 * Extends LegacyBlocklyLab for the shared run/reset/congrats interface.
 * Adds animation-tab switching and console inspection.
 */
export class GameLab extends LegacyBlocklyLab {
  /** Mode toggle: switches to code view. */
  readonly codeMode: Locator;

  /** Mode toggle: switches to animation-tab view. */
  readonly animationMode: Locator;

  /** "+" button in the animation list — present when animation tab is open. */
  readonly animationListNewItem: Locator;

  /** Debug/console output div — `#debug-output`. */
  readonly consoleOutput: Locator;

  constructor(page: Page) {
    super(page);
    this.codeMode = page.locator('#codeMode');
    this.animationMode = page.locator('#animationMode');
    this.animationListNewItem = page.locator('#newListItem');
    this.consoleOutput = page.locator('#debug-output');
  }

  /** Lesson 19 of allthethingscourse — used by reloadLevel(). */
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(19, level);
  }

  /**
   * Switch to the animation tab.
   * Clicks #animationMode and waits for the #newListItem ("+") button.
   * Mirrors `When I switch to the animation tab` from gamelab.rb.
   */
  async switchToAnimationTab(): Promise<void> {
    await this.animationMode.click();
    await this.animationListNewItem.waitFor({state: 'visible'});
  }

  /**
   * Switch back to code view from the animation tab.
   * Uses JS evaluate to click #codeMode, matching the Cucumber
   * `I switch to the code tab in Game Lab` step (jQuery-based click).
   */
  async switchToCodeTab(): Promise<void> {
    await this.page.evaluate(() => {
      (document.querySelector('#codeMode') as HTMLElement)?.click();
    });
    await this.runButton.waitFor({state: 'visible'});
  }

  /**
   * Count of animations in the animation column (excludes the "+" new-item button).
   * Mirrors `I see N animations in the animation column` from gamelab.rb.
   */
  async animationCount(): Promise<number> {
    return this.page.evaluate(() => {
      const buttons = document.querySelectorAll(
        '.animationList > div > button',
      );
      const newItem = document.querySelector('#newListItem');
      let count = 0;
      buttons.forEach(btn => {
        if (btn !== newItem) count++;
      });
      return count;
    });
  }

  /**
   * Open the animation picker by clicking #newListItem via JS.
   * Mirrors `I open the animation picker` from gamelab.rb:
   *   execute_script("$(\"#newListItem\")[0].click();")
   */
  async openAnimationPicker(): Promise<void> {
    await this.page.evaluate(() => {
      (document.querySelector('#newListItem') as HTMLElement)?.click();
    });
  }

  /**
   * Select the first blank-animation tile in the picker.
   * Mirrors `I select a blank animation`:
   *   $(".uitest-animation-picker-list>div>div>div>button")[0].click()
   */
  async selectBlankAnimation(): Promise<void> {
    await this.page.waitForFunction(() => {
      const btns = document.querySelectorAll(
        '.uitest-animation-picker-list>div>div>div>button',
      );
      return btns.length > 0;
    });
    await this.page.evaluate(() => {
      const btns = document.querySelectorAll<HTMLElement>(
        '.uitest-animation-picker-list>div>div>div>button',
      );
      btns[0]?.click();
    });
  }

  /**
   * Select the Animals category tab in the animation library picker.
   * Mirrors `I select the animal category of the animation library`:
   *   waits for img[src*='/category_animals.png'] then clicks index [1]
   */
  async selectAnimalCategory(): Promise<void> {
    await this.page.waitForFunction(() => {
      return (
        document.querySelectorAll("img[src*='/category_animals.png']").length >
        0
      );
    });
    await this.page.evaluate(() => {
      const imgs = document.querySelectorAll<HTMLElement>(
        "img[src*='/category_animals.png']",
      );
      imgs[1]?.click();
    });
  }

  /**
   * Click the bear animal-head thumbnail in the animal category.
   * Mirrors `I select the bear animal head animation from the animal category`:
   *   waits for img[src*='/category_animals/animalhead_bear.png'] then clicks [0]
   */
  async selectBearAnimation(): Promise<void> {
    await this.page.waitForFunction(() => {
      return (
        document.querySelectorAll(
          "img[src*='/category_animals/animalhead_bear.png']",
        ).length > 0
      );
    });
    await this.page.evaluate(() => {
      const imgs = document.querySelectorAll<HTMLElement>(
        "img[src*='/category_animals/animalhead_bear.png']",
      );
      imgs[0]?.click();
    });
  }

  /**
   * Click the animation picker's "done" button.
   * Mirrors `I select the animation picker 'done' button`:
   *   clicks .ui-test-selector-done-button once visible
   */
  async clickAnimationPickerDone(): Promise<void> {
    await this.page
      .locator('.ui-test-selector-done-button')
      .waitFor({state: 'visible', timeout: 10_000});
    await this.page.locator('.ui-test-selector-done-button').click();
  }

  /**
   * Add a new blank animation: open picker → select blank tile.
   * Mirrors `I add a new, blank animation` from gamelab.rb.
   */
  async addBlankAnimation(): Promise<void> {
    await this.openAnimationPicker();
    await this.selectBlankAnimation();
  }

  /**
   * Add bear animation from library: open picker → Animals category → bear → done.
   * Mirrors `I add the bear animal head animation from the library` from gamelab.rb.
   */
  async addBearAnimation(): Promise<void> {
    await this.openAnimationPicker();
    await this.selectAnimalCategory();
    await this.selectBearAnimation();
    await this.clickAnimationPickerDone();
  }
}
