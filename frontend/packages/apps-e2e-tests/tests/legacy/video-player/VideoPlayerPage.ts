import {type Locator, type Page} from '@playwright/test';

import {expect} from '../../shared/fixtures';

const FLAPPY_YOUTUBE_URL =
  'https://www.youtube-nocookie.com/embed/VQ4lo6Huylc/?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=VQ4lo6Huylc&wmode=transparent';

/**
 * Page object for legacy video player flows.
 */
export class VideoPlayerPage {
  readonly page: Page;
  readonly closeButton: Locator;
  readonly fallbackDownloadLink: Locator;
  readonly youtubeFrame: Locator;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
    this.closeButton = page.locator('#x-close');
    this.fallbackDownloadLink = page
      .getByRole('link', {name: 'Download Video'})
      .or(page.getByRole('button', {name: 'Download Video'}));
    this.youtubeFrame = page.locator('#video');
  }

  /**
   * Navigates to a video level after resetting the session.
   *
   * @param url - video level path
   */
  async open(url: string): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
  }

  /**
   * Waits for the modal video shell used by Flappy level pages.
   */
  async expectFlappyVideoDialogReady(): Promise<void> {
    await expect(this.closeButton).toBeVisible({timeout: 30_000});
  }

  /**
   * Waits for the fallback video UI visible to users.
   *
   * The video.js element may be hidden when the Flappy dialog opens in its
   * fallback-notes state. The durable user-visible signal across fallback
   * player variants is the Download Video control.
   */
  async expectFallbackPlayerReady(): Promise<void> {
    await expect(this.fallbackDownloadLink).toBeVisible({timeout: 30_000});
  }

  /**
   * Waits for the fallback video UI visible to users.
   *
   * The current video.js skin exposes a "Play Video" control to the
   * accessibility tree, but keeps the `.vjs-big-play-button` element hidden
   * while the black player surface and caption/download links are visible.
   * The visible readiness signal is therefore the Download Video control.
   */
  async expectFallbackPlayButtonReady(): Promise<void> {
    await this.expectFallbackPlayerReady();
  }

  /**
   * Verifies the Flappy YouTube iframe matches the Cucumber helper.
   */
  async expectFlappyYouTubeEmbed(): Promise<void> {
    await expect(this.youtubeFrame).toBeVisible({timeout: 30_000});
    await expect(this.youtubeFrame).toHaveAttribute('src', FLAPPY_YOUTUBE_URL);
  }
}
