import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

/**
 * Page Object for a level in the step course.
 *
 * Step mode is a CSF workspace feature that executes one block per click of
 * #stepButton. Level 1 (step-only) hides #runButton entirely; level 2
 * (step and run) shows both. Both hooks are overridden to wait on #stepButton
 * so gotoLevel() works for either level.
 */
export class StepModeLevel extends LegacyBlocklyLab {
  /** Advances execution by one block. Disabled while a step is in progress. */
  readonly stepButton: Locator;

  constructor(page: Page) {
    super(page);
    this.stepButton = page.locator('#stepButton');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(1, level, 'step');
  }

  protected override async waitForInitialLoad(): Promise<void> {
    await expect(this.stepButton).toBeVisible();
  }

  override async waitForReady(): Promise<void> {
    await expect(this.stepButton).toBeVisible();
    await expect(this.stepButton).toBeEnabled();
    await expect(this.page.locator('.uitest-signincallout')).toBeHidden();
  }

  /** Click the step button to execute one block. */
  async step(): Promise<void> {
    await this.stepButton.click();
  }
}
