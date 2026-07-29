import {type Locator, type Page} from '@playwright/test';

/** The caption link and dialog beside a video.js fallback player (FallbackPlayerCaptionDialogLink.jsx). */
export class FallbackPlayerCaptionDialogLinkComponent {
  /** Component's root wrapper; scopes a11y scans to this feature's own mount. */
  readonly rootSelector = '#fallback-player-caption-dialog-link';

  /** video.js's play button; role=button name "Play Video" (locale-invariant default). includeHidden for autoplay=1's display:none container; presence-only per the legacy step. */
  readonly bigPlayButton: Locator;

  /** Bare onClick <a>, no href/role — not reachable via getByRole (a11y gap). */
  readonly captionLink: Locator;

  /** Real heading with a stable accessible name — addressed by role+name. */
  readonly dialogHeading: Locator;

  /** Renders as a plain <div> via the deprecated Button variant — no button role (a11y gap). */
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.bigPlayButton = page.getByRole('button', {
      name: 'Play Video',
      includeHidden: true,
    });
    this.captionLink = page.locator(
      '.ui-test-fallback-player-caption-dialog-link',
    );
    this.dialogHeading = page.getByRole('heading', {
      name: 'Closed captioning and translations available on YouTube',
    });
    this.closeButton = page.locator(
      '.ui-test-fallback-player-caption-dialog-close',
    );
  }

  /** Open the captions dialog. */
  async open(): Promise<void> {
    await this.captionLink.click();
  }

  /** Close the captions dialog. */
  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
