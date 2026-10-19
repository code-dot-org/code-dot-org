import {expect, test, type Locator} from 'playwright/test';

import {BuiltInControls} from './drivers/BuiltInControls';
import {VideoPage} from './poms/VideoPage';

function opacity(locator: Locator): Promise<string> {
  return locator.evaluate(el => getComputedStyle(el).opacity);
}

// Behavior of the built-in controls alone; shared behavior is in
// controls.spec.ts.
test.describe('built-in controls only', () => {
  test('clicking the picture toggles playback', async ({page}) => {
    const videoPage = await VideoPage.load(page);
    const controls = new BuiltInControls(videoPage.video);

    await videoPage.video.click();
    await expect(controls.playButton).toHaveAccessibleName('Pause');
    await videoPage.video.click();
    await expect(controls.playButton).toHaveAccessibleName('Play');
  });

  test('the bar fades while playing unless hovered', async ({page}) => {
    const videoPage = await VideoPage.load(page);
    const controls = new BuiltInControls(videoPage.video);
    await controls.play();

    await page.mouse.move(0, 0);
    await expect.poll(() => opacity(controls.root)).toBe('0');
    await videoPage.video.hover();
    await expect.poll(() => opacity(controls.root)).toBe('1');
  });

  test('a narrow player hides the time display', async ({page}) => {
    const videoPage = await VideoPage.load(page, {width: 250});
    const timeDisplay = videoPage.video.locator('[part="time-display"]');

    await expect(timeDisplay).toBeHidden();
  });

  test('a broken video reports an error and disables the bar', async ({
    page,
  }) => {
    const videoPage = await VideoPage.load(page, {video: 'broken'});
    const controls = new BuiltInControls(videoPage.video);

    expect(await videoPage.errorCode()).toBe(3);
    expect(
      await controls.root.evaluate(el => getComputedStyle(el).pointerEvents),
    ).toBe('none');
  });
});
