import {errors, expect, type Locator, type Page} from '@playwright/test';

// The modal autoplays from a JS call rather than being present at
// domcontentloaded, so dismissIfShown waits this long before concluding it is
// not coming. Only called from level navigation, where it is expected, so this
// is an appearance ceiling, not a routine wait.
const APPEAR_TIMEOUT_MS = 2_000;

/**
 * A level's intro video-tutorial modal (showVideoDialog in
 * apps/src/code-studio/videos.js): a full-viewport overlay shown on a level's
 * first anonymous load of the session, recorded in localStorage once seen. Its
 * backdrop blocks clicks on everything underneath until it is closed.
 *
 * `?noautoplay=true` normally suppresses it, but the app's redirect chain drops
 * that query param whenever the URL also carries a `/lang/<code>` segment, so
 * localized level loads still get it.
 */
export class IntroVideoModalComponent {
  /** By class: the Bootstrap-era backdrop carries no role or accessible name. */
  readonly modal: Locator;

  readonly closeButton: Locator;

  constructor(page: Page) {
    this.modal = page.locator('.video-modal');
    this.closeButton = this.modal.getByRole('button', {name: 'Close'});
  }

  /**
   * Dismiss the modal if this load autoplayed it. A timeout — and only a
   * timeout — is taken to mean it never will appear. Any other failure (page
   * closed, navigation) propagates rather than being swallowed as "not shown".
   */
  async dismissIfShown(): Promise<void> {
    try {
      await this.modal.waitFor({state: 'visible', timeout: APPEAR_TIMEOUT_MS});
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        return;
      }
      throw error;
    }
    await this.closeButton.click();
    await expect(this.modal).toBeHidden();
  }
}
