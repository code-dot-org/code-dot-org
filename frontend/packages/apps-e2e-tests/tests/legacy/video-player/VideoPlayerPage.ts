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
  readonly fallbackPlayer: Locator;
  readonly fallbackPlayButton: Locator;
  readonly youtubeFrame: Locator;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
    this.closeButton = page.locator('#x-close');
    this.fallbackPlayer = page.locator('.video-js');
    this.fallbackPlayButton = page.locator('.vjs-big-play-button');
    this.youtubeFrame = page.locator('#video');
  }

  /**
   * Navigates to a video level after resetting the session.
   *
   * @param url - video level path
   */
  async open(url: string): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(url);
  }

  /**
   * Waits for the modal video shell used by Flappy level pages.
   */
  async expectFlappyVideoDialogReady(): Promise<void> {
    await expect(this.closeButton).toBeVisible({timeout: 30_000});
  }

  /**
   * Waits for the fallback video player visible to users.
   */
  async expectFallbackPlayerReady(): Promise<void> {
    await expect(this.fallbackPlayer).toBeVisible({timeout: 30_000});
  }

  /**
   * Waits for a fallback video play button visible to users.
   */
  async expectFallbackPlayButtonReady(): Promise<void> {
    await expect(this.fallbackPlayButton).toBeVisible({timeout: 30_000});
  }

  /**
   * Verifies the Flappy YouTube iframe matches the Cucumber helper.
   */
  async expectFlappyYouTubeEmbed(): Promise<void> {
    await expect(this.youtubeFrame).toBeVisible({timeout: 30_000});
    await expect(this.youtubeFrame).toHaveAttribute('src', FLAPPY_YOUTUBE_URL);
  }
}
