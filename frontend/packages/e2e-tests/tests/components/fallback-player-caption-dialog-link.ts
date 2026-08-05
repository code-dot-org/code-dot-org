import {type Locator, type Page} from '@playwright/test';

/** Caption link and dialog beside a video.js fallback player (FallbackPlayerCaptionDialogLink.jsx). */
export class FallbackPlayerCaptionDialogLinkComponent {
  readonly rootSelector = '#fallback-player-caption-dialog-link';

  /** The open dialog alone. BaseDialog gives it no role, hence the class. */
  readonly dialogSelector = `${this.rootSelector} .modal.dash_modal`;

  /** includeHidden: autoplay=1 leaves the container display:none. */
  readonly bigPlayButton: Locator;

  /** Bare onClick <a>, no href/role (a11y gap). */
  readonly captionLink: Locator;

  readonly dialogHeading: Locator;

  /** Plain <div> via the deprecated Button variant, no button role (a11y gap). */
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

  async open(): Promise<void> {
    await this.captionLink.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
