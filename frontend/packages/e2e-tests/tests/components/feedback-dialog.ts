import {type Locator, type Page} from '@playwright/test';

import {LegacyDialogComponent} from './legacy-dialog';

/** Root selector; a11y scans scope here. */
export const FEEDBACK_DIALOG_SELECTOR = '.modal';

/**
 * The run-feedback dialog every legacy Blockly lab shows after a program runs
 * (apps/src/feedback.js): congratulations on success, the failure message
 * otherwise. Distinct from the inline feedback panel the same labs render
 * below the instructions.
 */
export class FeedbackDialogComponent extends LegacyDialogComponent {
  /** Root selector; a11y scans scope here. */
  readonly rootSelector = FEEDBACK_DIALOG_SELECTOR;

  /** Congratulations text shown on puzzle completion. */
  readonly congratsMessage: Locator;

  constructor(page: Page) {
    super(page.locator(FEEDBACK_DIALOG_SELECTOR));
    this.congratsMessage = this.container.locator('.congrats');
  }
}
