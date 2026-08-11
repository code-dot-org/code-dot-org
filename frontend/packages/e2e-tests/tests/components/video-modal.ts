import {expect, type Locator, type Page} from '@playwright/test';

/**
 * The level-video modal (apps/src/code-studio/videos.js): autoplays once per
 * browser session for a level with an autoplaying video, or reopens on demand
 * via the level's reference-area link. Level chrome shared across CSF labs,
 * not a page of its own — composed onto lab page objects (`lab.videoModal`),
 * mirroring AuthoredHintsComponent/CalloutsComponent. "Shown once" is a plain
 * sessionStorage key ('video'), written only when the modal is closed — so it
 * suppresses only the automatic autoplay trigger, not manual reopening, and
 * scopes to the browser context, not the account.
 */
export class VideoModalComponent {
  /** Root selector; a11y scans scope here. */
  readonly rootSelector = '.video-modal';

  /** The modal container (a fixed, full-viewport overlay). */
  readonly root: Locator;

  /** The embedded (cross-origin) YouTube player iframe. */
  readonly videoFrame: Locator;

  constructor(page: Page) {
    this.root = page.locator(this.rootSelector);
    this.videoFrame = this.root.locator('iframe#video');
  }

  /**
   * Wait for the embedded YouTube iframe's own load event. It's cross-origin,
   * so axe can't inspect its content, but it keeps mounting its OWN
   * attributes (e.g. an aria-label on its player div) on the host document
   * for a while after the iframe element itself first attaches — an a11y scan
   * that races that mount sees a different violation set per run. Frame-level
   * load state is unaffected by cross-origin restrictions, unlike scripted
   * access to its content.
   *
   * The load event alone is not enough. createVideo() builds the iframe with
   * no `title` (apps/src/code-studio/videos.js), so the only title it ever
   * gets is the one YouTube's own YT.Player writes when it decorates the
   * element — measured on webkit as still absent at the load event on 2 of 3
   * runs, landing 250-500ms later. A scan in that window reports an extra
   * `frame-title` violation. Waiting for the attribute pins the scan to the
   * settled DOM.
   */
  async waitForVideoLoaded(): Promise<void> {
    const handle = await this.videoFrame.elementHandle();
    const contentFrame = await handle?.contentFrame();
    await contentFrame?.waitForLoadState('load');
    await expect(this.videoFrame).toHaveAttribute('title', /\S/);
  }
}
