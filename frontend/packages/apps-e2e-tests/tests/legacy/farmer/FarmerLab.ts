import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

/**
 * Page Object for the Farmer lab — lesson 6 of allthethingscourse.
 * Extends LegacyBlocklyLab with farmer-specific locators and game-state helpers.
 * lightbulb, hintCount, instructionsPanel, and acceptHint() are inherited.
 */
export class FarmerLab extends LegacyBlocklyLab {
  /** The farmer character rendered in the grid. */
  readonly pegman: Locator;

  /** The static farmer avatar image used as level art. */
  readonly farmerAvatar: Locator;

  protected override get instructionsSelector(): string {
    return '.instructions-markdown p';
  }

  constructor(page: Page) {
    super(page);
    this.pegman = page.locator('#pegman');
    this.farmerAvatar = page.locator('img[src*="farmer/small_static_avatar"]');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(6, level);
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
