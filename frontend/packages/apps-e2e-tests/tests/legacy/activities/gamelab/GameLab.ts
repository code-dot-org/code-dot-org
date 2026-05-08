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
}
