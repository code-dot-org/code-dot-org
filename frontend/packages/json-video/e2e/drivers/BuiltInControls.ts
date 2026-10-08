import {expect, type Locator} from 'playwright/test';

import {ControlBar} from './ControlsDriver';

/** The controls the element draws in its shadow root under `controls`. */
export class BuiltInControls extends ControlBar {
  private readonly video: Locator;

  constructor(video: Locator) {
    const bar = video.locator('[part="controls-bar"]');
    super('built-in', bar, bar.locator('[part="current-time"]'));
    this.video = video;
  }

  // The bar fades out while playing unless the pointer is over the video.
  protected override async reveal(): Promise<void> {
    await this.video.hover();
  }

  // At rest the zero-width volume slider overlaps the mute button, so the
  // button looks covered; hovering expands the slider and uncovers it, as it
  // does for a user. `force` skips only the covered check on that hover.
  protected override async revealVolume(): Promise<void> {
    await this.button('Mute').or(this.button('Unmute')).hover({force: true});
    await expect(this.slider('Volume')).toBeVisible();
  }

  protected override async click(name: string): Promise<void> {
    if (name !== 'Mute' && name !== 'Unmute') return super.click(name);
    await this.revealVolume();
    await this.button(name).click();
  }
}
