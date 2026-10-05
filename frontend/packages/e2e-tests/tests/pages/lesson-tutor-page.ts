import {expect, type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

export interface LessonTutorUrlParams {
  /** Unit name, e.g. `aif1-v2-2025`. */
  unit: string;
  /** Lesson position within the unit, 1-based. */
  lesson: number;
  /** Screen segment after /tutor; the review-modality chooser by default. */
  screen?: string;
}

/**
 * One of the two <audio> elements inside <json-video>. `src` is a fingerprint
 * (length and tail) rather than the attribute itself: the pipeline inlines
 * clips as data URIs, and a failure message quoting one would be unreadable.
 */
export interface VideoAudioTrack {
  paused: boolean;
  currentTime: number;
  src: string | null;
}

export interface VideoAudioTracks {
  /** The video's top-level track, if it has one. */
  main: VideoAudioTrack;
  /** The current scene's own clip, if it has one. */
  scene: VideoAudioTrack;
}

type JsonVideoElement = HTMLElement & {
  currentTime: number;
  duration: number;
  _mainAudio: HTMLAudioElement;
  _sceneAudio: HTMLAudioElement;
};

/**
 * Page object for the AI Tutor+ lesson deep dive, /s/:unit/lessons/:n/tutor,
 * the post-lesson review flow. Screens are URL segments after /tutor. The
 * `intervention` screen is the review-modality chooser; its "Watch a video"
 * card renders the lesson's json videos, as a carousel when there are several.
 */
export class LessonTutorPage extends BasePage {
  /** Card on the intervention screen that opens the lesson's videos. */
  readonly watchVideoCard: Locator;

  /** The <json-video> player; the carousel reuses one element across videos. */
  readonly video: Locator;

  /** The player's play/pause toggle, inside its shadow root. */
  readonly playButton: Locator;

  /** Carousel controls; present only when the lesson has more than one video. */
  readonly nextVideoButton: Locator;
  readonly previousVideoButton: Locator;

  constructor(page: Page) {
    super(page);
    this.watchVideoCard = page.getByRole('button', {name: 'Watch a video'});
    this.video = page.locator('json-video');
    this.playButton = this.video.locator('#play-btn');
    this.nextVideoButton = page.getByRole('button', {name: 'Next video'});
    this.previousVideoButton = page.getByRole('button', {
      name: 'Previous video',
    });
  }

  /** Open a deep dive screen. The flow is behind the lesson-tutor experiment. */
  async gotoScreen({
    unit,
    lesson,
    screen = 'intervention',
  }: LessonTutorUrlParams): Promise<void> {
    const query = new URLSearchParams({enableExperiments: 'lesson-tutor'});
    await this.page.goto(
      `/s/${unit}/lessons/${lesson}/tutor/${screen}?${query}`,
      {waitUntil: 'domcontentloaded'},
    );
  }

  /** Pick "Watch a video" and wait for the first video's document to load. */
  async openVideos(): Promise<void> {
    await this.watchVideoCard.click();
    await expect(this.video).toBeAttached();
    await expect.poll(() => this.duration()).toBeGreaterThan(0);
  }

  /** Seconds; 0 until the element has a document. */
  duration(): Promise<number> {
    return this.video.evaluate(el => (el as JsonVideoElement).duration);
  }

  /** Move the playhead, as dragging the player's progress bar does. */
  seek(seconds: number): Promise<void> {
    return this.video.evaluate((el, s) => {
      (el as JsonVideoElement).currentTime = s;
    }, seconds);
  }

  /** State of both audio tracks; see VideoAudioTrack. */
  audioTracks(): Promise<VideoAudioTracks> {
    return this.video.evaluate(el => {
      const read = (audio: HTMLAudioElement) => {
        const src = audio.getAttribute('src');
        return {
          paused: audio.paused,
          currentTime: audio.currentTime,
          src: src ? `${src.length}:${src.slice(-32)}` : null,
        };
      };
      const player = el as JsonVideoElement;
      return {main: read(player._mainAudio), scene: read(player._sceneAudio)};
    });
  }

  /**
   * Click a carousel control and wait for the player to finish loading the
   * video it switches to. The element fetches the new document after the
   * click, so a plain click returns while the previous video is still loaded.
   */
  async switchVideo(control: Locator): Promise<void> {
    await this.video.evaluate(el => {
      window.__jsonVideoLoaded = new Promise<void>((resolve, reject) => {
        el.addEventListener('loadeddata', () => resolve(), {once: true});
        el.addEventListener(
          'error',
          () => reject(new Error('json-video failed to load')),
          {once: true},
        );
      });
    });
    await control.click();
    await this.page.evaluate(() => window.__jsonVideoLoaded);
  }
}

declare global {
  interface Window {
    __jsonVideoLoaded?: Promise<void>;
  }
}
