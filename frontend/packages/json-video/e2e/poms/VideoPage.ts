import {
  expect,
  type FrameLocator,
  type Locator,
  type Page,
} from 'playwright/test';

/** The demo's query parameters; see demo/main.ts. */
export interface VideoPageOptions {
  /** A key of VIDEOS in demo/videos.ts. */
  video?: string;
  /** Player width in CSS pixels. */
  width?: number;
  /** The element's own controls, or the demo's custom bar. */
  controls?: 'builtin' | 'custom';
}

/** The parts of the element's media interface the tests read. */
interface MediaState {
  paused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted?: boolean;
  textTracks: {0: {mode: string}};
  error: {code: number} | null;
}

/**
 * Page Object for the demo page: one <json-video>, with the page clock
 * installed so playback advances only through `advance()`.
 */
export class VideoPage {
  readonly page: Page;
  readonly video: Locator;

  /** The scene iframe, inside the element's shadow root. */
  readonly scene: FrameLocator;

  /** The caption overlay drawn over the scene. */
  readonly captions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.video = page.locator('json-video');
    this.scene = this.video.frameLocator('[part="scene"]');
    this.captions = this.video.locator('[part="captions"]');
  }

  /** Install the clock, open the demo, and wait for the video to load. */
  static async load(
    page: Page,
    options: VideoPageOptions = {},
  ): Promise<VideoPage> {
    await page.clock.install();
    const params = new URLSearchParams();
    if (options.video) params.set('video', options.video);
    if (options.width) params.set('width', String(options.width));
    if (options.controls) params.set('controls', options.controls);
    await page.goto(`/?${params}`);
    const videoPage = new VideoPage(page);
    await expect
      .poll(() =>
        videoPage.video.evaluate(el => {
          const media = el as unknown as MediaState;
          return media.duration > 0 || media.error !== null;
        }),
      )
      .toBe(true);
    // Installed time still flows; freeze it so only advance() moves playback.
    // The margin keeps the target ahead of time that passes during the call.
    const now = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(now + 1000);
    return videoPage;
  }

  paused(): Promise<boolean> {
    return this.video.evaluate(el => (el as unknown as MediaState).paused);
  }

  currentTime(): Promise<number> {
    return this.video.evaluate(el => (el as unknown as MediaState).currentTime);
  }

  duration(): Promise<number> {
    return this.video.evaluate(el => (el as unknown as MediaState).duration);
  }

  volume(): Promise<number> {
    return this.video.evaluate(el => (el as unknown as MediaState).volume);
  }

  /** Muted, or at zero volume; either counts as silent. */
  silent(): Promise<boolean> {
    return this.video.evaluate(el => {
      const media = el as unknown as MediaState;
      return media.muted === true || media.volume === 0;
    });
  }

  /** The captions track's mode: disabled, hidden or showing. */
  captionMode(): Promise<string> {
    return this.video.evaluate(
      el => (el as unknown as MediaState).textTracks[0].mode,
    );
  }

  errorCode(): Promise<number | null> {
    return this.video.evaluate(
      el => (el as unknown as MediaState).error?.code ?? null,
    );
  }

  isFullscreen(): Promise<boolean> {
    return this.video.evaluate(el => document.fullscreenElement === el);
  }

  /** Advance playback by `ms` of page time. */
  async advance(ms: number): Promise<void> {
    await this.page.clock.runFor(ms);
  }
}
