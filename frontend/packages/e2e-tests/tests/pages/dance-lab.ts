import type {Locator, Page} from '@playwright/test';

import {AgeDialogComponent} from '../components/age-dialog';
import {DanceAiModalComponent} from '../components/dance-ai-modal';

import {LegacyBlocklyLab} from './legacy-blockly-lab';

/** The Dance Party lab (apps/src/dance). */
export class DanceLab extends LegacyBlocklyLab {
  /** COPPA/age-gate interstitial embedded in the visualization column. */
  readonly ageDialog: AgeDialogComponent;

  /** The AI effect-generator modal opened from a Dancelab_ai block's field. */
  readonly aiModal: DanceAiModalComponent;

  /**
   * A dance_ai block's editable field, scoped under a specific parent block
   * (e.g. 'setup'). Clicking it (via clickBlockField) opens aiModal.
   */
  danceAiFieldSelector(parentBlockId: string, blockId: string): string {
    return `[data-id='${parentBlockId}'] > [data-id='${blockId}'] > .blocklyEditableField`;
  }

  /**
   * After Convert splices two effect blocks into a parent block in place of
   * the single dance_ai field block, each spliced block's outline renders
   * here. CSS: Blockly SVG internals, no accessible role (a11y gap).
   */
  convertedEffectBlockPaths(parentBlockId: string): Locator {
    return this.page.locator(
      `[data-id="${parentBlockId}"] > g > g > .blocklyPath`,
    );
  }

  constructor(page: Page) {
    super(page);
    this.ageDialog = new AgeDialogComponent(page);
    this.aiModal = new DanceAiModalComponent(page);
  }
}
