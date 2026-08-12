import {errors, expect, type Locator, type Page} from '@playwright/test';

import {LegacyDialogComponent} from './legacy-dialog';

// The modal autoplays from a JS call rather than being present at
// domcontentloaded, so dismissIfShown waits this long before concluding it is
// not coming. Only called from level navigation, where it is expected, so this
// is an appearance ceiling, not a routine wait.
const APPEAR_TIMEOUT_MS = 2_000;

/** Root selector; a11y scans scope here. */
export const INTRO_VIDEO_MODAL_SELECTOR = '.video-modal';

/**
 * A level's intro video-tutorial modal (showVideoDialog in
 * apps/src/code-studio/videos.js): a full-viewport overlay shown on a level's
 * first anonymous load of the session, recorded in sessionStorage once seen.
 * Its backdrop blocks clicks on everything underneath until it is closed.
 *
 * `?noautoplay=true` normally suppresses it, but the app's redirect chain drops
 * that query param whenever the URL also carries a `/lang/<code>` segment, so
 * localized level loads still get it.
 *
 * Because "seen" is recorded only on close, the flag suppresses the automatic
 * autoplay trigger and not a manual reopen from the level's reference area.
 */
export class IntroVideoModalComponent extends LegacyDialogComponent {
  /** Root selector; a11y scans scope here. */
  readonly rootSelector = INTRO_VIDEO_MODAL_SELECTOR;

  /** The embedded (cross-origin) YouTube player iframe. */
  readonly videoFrame: Locator;

  constructor(page: Page) {
    super(page.locator(INTRO_VIDEO_MODAL_SELECTOR));
    this.videoFrame = this.container.locator('iframe#video');
  }

  /**
   * Dismiss the modal if this load autoplayed it. A timeout — and only a
   * timeout — is taken to mean it never will appear. Any other failure (page
   * closed, navigation) propagates rather than being swallowed as "not shown".
   */
  async dismissIfShown(): Promise<void> {
    try {
      await this.container.waitFor({
        state: 'visible',
        timeout: APPEAR_TIMEOUT_MS,
      });
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        return;
      }
      throw error;
    }
    await this.close();
    await expect(this.container).toBeHidden();
  }

  /**
   * Wait for the embedded YouTube iframe's own load event. It's cross-origin,
   * so axe can't inspect its content, but it keeps mounting its OWN attributes
   * (e.g. an aria-label on its player div) on the host document for a while
   * after the iframe element itself first attaches — an a11y scan that races
   * that mount sees a different violation set per run. Frame-level load state
   * is unaffected by cross-origin restrictions, unlike scripted access to its
   * content.
   *
   * The load event alone is not enough. createVideo() builds the iframe with no
   * `title` (apps/src/code-studio/videos.js), so the only title it ever gets is
   * the one YouTube's own YT.Player writes when it decorates the element —
   * measured on webkit as still absent at the load event on 2 of 3 runs,
   * landing 250-500ms later. A scan in that window reports an extra
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
