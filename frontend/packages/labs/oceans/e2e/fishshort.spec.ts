import {expect, test} from './fixtures/visual';
import {FishShortPage} from './poms/FishShortPage';
import {AppMode, OceansPage} from './poms/OceansPage';

/*
 * FishShort — Pond info panel
 */

test.describe('FishShort — pond info panel', () => {
  test('info button visible and has aria-pressed after full flow', async ({
    page,
  }) => {
    const oceans = await FishShortPage.load(page, 'Blue');
    // 1 yes + 1 no satisfies pondFish.length > 0 && recallFish.length > 0
    await oceans.train(1, 1);
    await oceans.fullFlow();
    // Info button only appears in FishShort/FishLong when both fish sets populated
    await expect(oceans.infoButton).toBeVisible({timeout: 10_000});
    await expect(oceans.infoButton).toHaveAttribute(
      'aria-pressed',
      /^(true|false)$/,
    );
  });

  test('info button toggles aria-pressed on click', async ({page}) => {
    const oceans = await FishShortPage.load(page, 'Blue');
    await oceans.train(1, 1);
    await oceans.fullFlow();
    await expect(oceans.infoButton).toBeVisible({timeout: 10_000});
    await expect(oceans.infoButton).toHaveAttribute('aria-pressed', 'false');
    await oceans.infoButton.click();
    await expect(oceans.infoButton).toHaveAttribute('aria-pressed', 'true');
  });
});

/*
 * Visual regression
 */

test.describe('@visual', () => {
  test('words scene before any word click', async ({page, visualCheck}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort, {freeze: true});
    await oceans.waitForWordsScene();
    await visualCheck('fishshort-words');
  });

  test('training scene after selecting Blue', async ({page, visualCheck}) => {
    await FishShortPage.load(page, 'Blue', {freeze: true});
    await visualCheck('fishshort-training-blue');
  });
});
