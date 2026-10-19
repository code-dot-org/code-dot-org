import {expect, test} from 'playwright/test';

import {VideoPage} from './poms/VideoPage';
import {VARIANTS} from './variants';

// Behavior every set of controls must share. The threeScenes video is three
// 2 s scenes; the middle one has no speech.
for (const variant of VARIANTS) {
  test.describe(`${variant.name} controls`, () => {
    test('play advances time and pause stops it', async ({page}) => {
      const videoPage = await VideoPage.load(page, variant.options);
      const controls = variant.driver(videoPage);

      await controls.play();
      await expect(controls.playButton).toHaveAccessibleName('Pause');
      await videoPage.advance(1500);
      await controls.pause();

      await expect(controls.playButton).toHaveAccessibleName('Play');
      expect(await videoPage.currentTime()).toBeCloseTo(1.5, 1);
      await expect(controls.currentTimeText).toHaveText('0:01');
      await videoPage.advance(1000);
      expect(await videoPage.currentTime()).toBeCloseTo(1.5, 1);
    });

    test('playing to the end stops at the duration', async ({page}) => {
      const videoPage = await VideoPage.load(page, variant.options);
      const controls = variant.driver(videoPage);

      await controls.play();
      await videoPage.advance(7000);

      expect(await videoPage.paused()).toBe(true);
      expect(await videoPage.currentTime()).toBe(6);
      await expect(controls.playButton).toHaveAccessibleName('Play');
      await expect(controls.currentTimeText).toHaveText('0:06');
    });

    test('seeking shows the scene at that time', async ({page}) => {
      const videoPage = await VideoPage.load(page, variant.options);
      const controls = variant.driver(videoPage);

      await controls.seekTo(0.5);

      expect(await videoPage.currentTime()).toBe(3);
      await expect(controls.currentTimeText).toHaveText('0:03');
      await expect(
        videoPage.scene.getByRole('heading', {name: 'Scene 2'}),
      ).toBeVisible();
    });

    test('the volume slider sets the volume', async ({page}) => {
      const videoPage = await VideoPage.load(page, variant.options);
      const controls = variant.driver(videoPage);

      await controls.setVolume(0.5);

      expect(await videoPage.volume()).toBe(0.5);
    });

    test('unmuting restores the volume from before muting', async ({page}) => {
      const videoPage = await VideoPage.load(page, variant.options);
      const controls = variant.driver(videoPage);
      await controls.setVolume(0.4);

      await controls.mute();
      expect(await videoPage.silent()).toBe(true);
      await controls.unmute();

      expect(await videoPage.silent()).toBe(false);
      expect(await videoPage.volume()).toBe(0.4);
    });

    test('captions follow the scene while shown', async ({page}) => {
      const videoPage = await VideoPage.load(page, variant.options);
      const controls = variant.driver(videoPage);
      await expect(controls.captionsButton).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      await expect(videoPage.captions).toBeHidden();

      await controls.toggleCaptions();
      await expect(controls.captionsButton).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(videoPage.captions).toHaveText('First caption');
      expect(await videoPage.captionMode()).toBe('showing');

      await controls.seekTo(0.5);
      await expect(videoPage.captions).toBeHidden();

      await controls.seekTo(0.75);
      await expect(videoPage.captions).toHaveText('Third caption');

      await controls.toggleCaptions();
      await expect(videoPage.captions).toBeHidden();
      expect(await videoPage.captionMode()).toBe('disabled');
    });

    test('fullscreen can be entered and left', async ({page}) => {
      const videoPage = await VideoPage.load(page, variant.options);
      const controls = variant.driver(videoPage);

      await controls.enterFullscreen();
      await expect.poll(() => videoPage.isFullscreen()).toBe(true);
      await controls.exitFullscreen();
      await expect.poll(() => videoPage.isFullscreen()).toBe(false);
    });
  });
}
