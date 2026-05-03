import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

/** Page Object for the Bee lab — lesson 4 of allthethingscourse. */
export class BeeLab extends LegacyBlocklyLab {
  /** Button shown after suboptimal completion to request block feedback. */
  readonly hintRequestButton: Locator;

  /** Block feedback panel revealed by clicking hintRequestButton. */
  readonly feedbackBlocks: Locator;

  constructor(page: Page) {
    super(page);
    this.hintRequestButton = page.locator('#hint-request-button');
    this.feedbackBlocks = page.locator('#feedbackBlocks');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(4, level);
  }
}
