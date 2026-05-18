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
  readonly fallbackBigPlayButton: Locator;
  readonly fallbackDownloadLink: Locator;
  readonly fallbackInlinePlayer: Locator;
  readonly fallbackPlayerRegion: Locator;
  readonly videoModal: Locator;
  readonly youtubeFrame: Locator;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
    this.closeButton = page.locator('#x-close');
    this.fallbackBigPlayButton = page.locator('.vjs-big-play-button').first();
    this.fallbackDownloadLink = page
      .getByRole('link', {name: 'Download Video'})
      .or(page.getByRole('button', {name: 'Download Video'}));
    this.fallbackInlinePlayer = page.locator('.video-js').first();
    this.fallbackPlayerRegion = page.getByRole('region', {
      name: 'Video Player',
    });
    this.videoModal = page.locator('.video-modal.in').first();
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
    await expect(this.videoModal).toBeVisible({timeout: 30_000});
    await expect(this.fallbackInlinePlayer).toBeAttached({timeout: 30_000});
    await expect(this.fallbackDownloadLink).toBeVisible({timeout: 30_000});
    await this.waitForStableVideoModal();
  }

  /**
   * Waits for the fallback video UI visible to users.
   *
   * Cucumber waits for the legacy big-play selector to exist, but not to be
   * visible. The visible readiness signals are the video player region and the
   * Download Video control.
   */
  async expectFallbackPlayButtonReady(): Promise<void> {
    await expect(this.fallbackBigPlayButton).toBeAttached({timeout: 30_000});
    await expect(this.fallbackInlinePlayer).toBeVisible({timeout: 30_000});
    await expect(this.fallbackPlayerRegion).toBeVisible({timeout: 30_000});
    await expect(this.fallbackDownloadLink).toBeVisible({timeout: 30_000});
    await this.waitForStableFallbackInlinePlayer();
  }

  /**
   * Verifies the Flappy YouTube iframe matches the Cucumber helper.
   */
  async expectFlappyYouTubeEmbed(): Promise<void> {
    await expect(this.youtubeFrame).toBeVisible({timeout: 30_000});
    await expect(this.youtubeFrame).toHaveAttribute('src', FLAPPY_YOUTUBE_URL);
  }

  /**
   * Wait for the fallback video modal box and text to settle before a visual
   * checkpoint.
   */
  async waitForStableVideoModal(): Promise<void> {
    await this.page.waitForFunction(
      () =>
        new Promise<boolean>(resolve => {
          let previous = '';
          let stableFrames = 0;
          const signature = () =>
            ['.video-modal.in', '.video-modal.in #x-close']
              .flatMap(selector =>
                Array.from(document.querySelectorAll(selector)),
              )
              .map(element => {
                const box = element.getBoundingClientRect();
                const styles = getComputedStyle(element);
                return [
                  Math.round(box.x),
                  Math.round(box.y),
                  Math.round(box.width),
                  Math.round(box.height),
                  styles.opacity,
                  styles.transform,
                  element.textContent?.trim(),
                ].join(':');
              })
              .join('|');

          const check = () => {
            const current = signature();
            stableFrames = current === previous ? stableFrames + 1 : 0;
            previous = current;
            if (stableFrames >= 5) {
              resolve(true);
            } else {
              requestAnimationFrame(check);
            }
          };
          requestAnimationFrame(check);
        }),
      undefined,
      {timeout: 15_000},
    );
  }

  /**
   * Wait for inline fallback video pages to stop shifting before a visual
   * checkpoint.
   */
  async waitForStableFallbackInlinePlayer(): Promise<void> {
    await this.page.waitForFunction(
      () =>
        new Promise<boolean>(resolve => {
          let previous = '';
          let stableFrames = 0;
          const signature = () =>
            ['.video-js', '[aria-label="Video Player"]']
              .flatMap(selector =>
                Array.from(document.querySelectorAll(selector)),
              )
              .map(element => {
                const box = element.getBoundingClientRect();
                const styles = getComputedStyle(element);
                return [
                  Math.round(box.x),
                  Math.round(box.y),
                  Math.round(box.width),
                  Math.round(box.height),
                  styles.opacity,
                  styles.transform,
                  element.textContent?.trim(),
                ].join(':');
              })
              .join('|');

          const check = () => {
            const current = signature();
            stableFrames = current === previous ? stableFrames + 1 : 0;
            previous = current;
            if (stableFrames >= 5) {
              resolve(true);
            } else {
              requestAnimationFrame(check);
            }
          };
          requestAnimationFrame(check);
        }),
      undefined,
      {timeout: 15_000},
    );
  }
}
