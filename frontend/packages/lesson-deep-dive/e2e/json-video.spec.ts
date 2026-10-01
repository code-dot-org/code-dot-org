import {expect, test, type Page} from '@playwright/test';

// <json-video> plays through two <audio> elements in its shadow root: one for
// a video's top-level track, one for the current scene's own clip. The mock
// videos (src/dev/mocks.ts) cover one of each: v1 narrates per scene with no
// top-level track, 60 s long; v2 has a top-level track over one silent 30 s
// scene. The assertions read the audio elements' own state, never the
// speakers, so the clips can be silence.

type AudioState = {paused: boolean; currentTime: number; src: string | null};

type PlayerElement = HTMLElement & {
  duration: number;
  _mainAudio: HTMLAudioElement;
  _sceneAudio: HTMLAudioElement;
};

function audioState(page: Page, track: 'main' | 'scene'): Promise<AudioState> {
  return page.evaluate(track => {
    const player = document.querySelector('json-video') as PlayerElement;
    const audio = track === 'main' ? player._mainAudio : player._sceneAudio;
    return {
      paused: audio.paused,
      currentTime: audio.currentTime,
      src: audio.getAttribute('src'),
    };
  }, track);
}

// The element loads a new src asynchronously; its duration changing to the
// new video's is the signal that the load landed.
async function expectLoaded(page: Page, seconds: number): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        () => (document.querySelector('json-video') as PlayerElement).duration,
      ),
    )
    .toBe(seconds);
}

async function expectPlaying(page: Page, track: 'main' | 'scene') {
  await expect
    .poll(async () => (await audioState(page, track)).paused)
    .toBe(false);
  await expect
    .poll(async () => (await audioState(page, track)).currentTime)
    .toBeGreaterThan(0.1);
}

test.beforeEach(async ({page}) => {
  await page.goto('/video.html');
  await expectLoaded(page, 60);
});

test.describe('a video narrated per scene', () => {
  test('plays its scene clip when play is pressed', async ({page}) => {
    await page.locator('json-video').locator('#play-btn').click();

    await expectPlaying(page, 'scene');
    expect(await audioState(page, 'main')).toMatchObject({
      paused: true,
      src: null,
    });
  });

  test('stops the clip on pause and resumes it on play', async ({page}) => {
    const playBtn = page.locator('json-video').locator('#play-btn');

    await playBtn.click();
    await expectPlaying(page, 'scene');

    await playBtn.click();
    await expect
      .poll(async () => (await audioState(page, 'scene')).paused)
      .toBe(true);
    const pausedAt = (await audioState(page, 'scene')).currentTime;

    await playBtn.click();
    await expectPlaying(page, 'scene');
    await expect
      .poll(async () => (await audioState(page, 'scene')).currentTime)
      .toBeGreaterThan(pausedAt);
  });
});

test.describe('switching to another video', () => {
  test('drops the scene clip before a video with a main track', async ({
    page,
  }) => {
    const playBtn = page.locator('json-video').locator('#play-btn');
    await playBtn.click();
    await expectPlaying(page, 'scene');

    await page.getByRole('button', {name: 'Next video'}).click();
    await expectLoaded(page, 30);
    expect(await audioState(page, 'scene')).toMatchObject({
      paused: true,
      src: null,
    });

    await playBtn.click();
    await expectPlaying(page, 'main');
    expect(await audioState(page, 'scene')).toMatchObject({
      paused: true,
      src: null,
    });
  });

  test('drops the main track before a video narrated per scene', async ({
    page,
  }) => {
    const playBtn = page.locator('json-video').locator('#play-btn');
    await page.getByRole('button', {name: 'Next video'}).click();
    await expectLoaded(page, 30);
    await playBtn.click();
    await expectPlaying(page, 'main');

    await page.getByRole('button', {name: 'Previous video'}).click();
    await expectLoaded(page, 60);
    expect(await audioState(page, 'main')).toMatchObject({
      paused: true,
      src: null,
    });

    await playBtn.click();
    await expectPlaying(page, 'scene');
    expect(await audioState(page, 'main')).toMatchObject({
      paused: true,
      src: null,
    });
  });
});
