import type {Page} from 'playwright/test';

import {ControlBar} from './ControlsDriver';

/** The demo's custom control bar (demo/customControls.ts). */
export class CustomControls extends ControlBar {
  constructor(page: Page) {
    const bar = page.getByRole('group', {name: 'Video controls'});
    super('custom', bar, bar.getByTestId('current-time'));
  }
}
