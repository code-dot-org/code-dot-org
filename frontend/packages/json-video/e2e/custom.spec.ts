import {expect, test} from 'playwright/test';

import {CustomControls} from './drivers/CustomControls';
import {VideoPage} from './poms/VideoPage';

// What custom controls need from the element beyond the shared behavior in
// controls.spec.ts.
test.describe('custom controls only', () => {
  test('without controls, the built-in bar is gone and the picture is inert', async ({
    page,
  }) => {
    const videoPage = await VideoPage.load(page, {controls: 'custom'});

    await expect(videoPage.video.locator('[part="controls-bar"]')).toBeHidden();
    await videoPage.video.click({position: {x: 100, y: 100}});
    expect(await videoPage.paused()).toBe(true);
  });

  test('the bar stays visible and usable in fullscreen', async ({page}) => {
    const videoPage = await VideoPage.load(page, {controls: 'custom'});
    const controls = new CustomControls(page);

    await controls.enterFullscreen();
    await expect.poll(() => videoPage.isFullscreen()).toBe(true);
    await expect(controls.root).toBeInViewport();
    await controls.play();
    await expect(controls.playButton).toHaveAccessibleName('Pause');
  });

  test('the bar follows changes made through the API', async ({page}) => {
    const videoPage = await VideoPage.load(page, {controls: 'custom'});
    const controls = new CustomControls(page);

    await videoPage.video.evaluate(el => {
      const video = el as HTMLElementTagNameMap['json-video'];
      video.volume = 0.3;
      video.muted = true;
      video.textTracks[0].mode = 'showing';
      video.currentTime = 4;
    });
    // textTracks fires its change event a task later.
    await videoPage.advance(1);

    await expect(
      controls.root.getByRole('button', {name: 'Unmute'}),
    ).toBeVisible();
    await expect(controls.captionsButton).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(controls.currentTimeText).toHaveText('0:04');
    await expect(videoPage.captions).toHaveText('Third caption');
  });

  test('page styles reach the built-in parts through ::part()', async ({
    page,
  }) => {
    const videoPage = await VideoPage.load(page, {controls: 'custom'});

    // demo/index.html lifts the captions above the custom bar.
    expect(
      await videoPage.captions.evaluate(el => getComputedStyle(el).bottom),
    ).toBe('64px');
  });
});
