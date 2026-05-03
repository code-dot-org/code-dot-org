import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

/**
 * Page Object for the Farmer lab — lesson 6 of allthethingscourse.
 * Extends LegacyBlocklyLab with farmer-specific locators and game-state helpers.
 */
export class FarmerLab extends LegacyBlocklyLab {
  /** The farmer character rendered in the grid. */
  readonly pegman: Locator;

  /** The static farmer avatar image used as level art. */
  readonly farmerAvatar: Locator;

  /** Authored-hints lightbulb toggle button. */
  readonly lightbulb: Locator;

  /**
   * Hint count badge next to the lightbulb.
   * Removed from the DOM after the last hint is viewed — assert with
   * `not.toBeAttached()` at that point rather than `toBeHidden()`.
   */
  readonly hintCount: Locator;

  /**
   * Outer instructions container (.csf-top-instructions).
   * Authored hint text is appended here, so use toContainText rather than
   * the narrower `instructions` locator (.instructions-markdown p).
   */
  readonly instructionsPanel: Locator;

  protected override get instructionsSelector(): string {
    return '.instructions-markdown p';
  }

  constructor(page: Page) {
    super(page);
    this.pegman = page.locator('#pegman');
    this.farmerAvatar = page.locator('img[src*="farmer/small_static_avatar"]');
    this.lightbulb = page.locator('#lightbulb');
    this.hintCount = page.locator('#hintCount');
    this.instructionsPanel = page.locator('.csf-top-instructions');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(6, level);
  }

  /**
   * Click the 'Yes' confirm button on the hint prompt.
   * The lightbulb div[role=button] also contains "yes" in its aria-label;
   * exact:true is required to avoid a strict-mode violation.
   */
  async acceptHint(): Promise<void> {
    await this.page.getByRole('button', {name: 'Yes', exact: true}).click();
  }

  /**
   * Read the dirt amount at a grid cell from the live game state.
   * Source: Maze.controller.map.getValue(x, y)
   *
   * @param x - grid column
   * @param y - grid row
   */
  async getDirtAt(x: number, y: number): Promise<number> {
    return this.page.evaluate(
      ({x, y}: {x: number; y: number}) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Maze.controller.map.getValue(x, y) as number,
      {x, y},
    );
  }
}
