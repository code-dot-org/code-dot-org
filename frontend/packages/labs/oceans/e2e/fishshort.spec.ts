import {expect, test} from 'playwright/test';

import {AppMode, FishShortPage, OceansPage} from './OceansPage';

// ─────────────────────────────────────────────────────────────────────────────
// FishShort — Words scene
// ─────────────────────────────────────────────────────────────────────────────

test.describe('FishShort — words scene', () => {
  test('shows word-choice buttons before training', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    const count = await oceans.wordButtons.count();
    // FishShort has two columns: colors (3) + shapes (3) = 6 word buttons
    expect(count).toBe(6);
  });

  test('word question prompt is visible', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    await expect(
      page.getByText('What type of fish do you want to train', {exact: false}),
    ).toBeVisible();
  });

  test('clicking a word advances to training scene', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    await page.getByRole('button', {name: 'Blue'}).click();
    await oceans.waitForTrainingScene();
  });

  test('training question includes the selected word', async ({page}) => {
    const oceans = new OceansPage(page);
    await oceans.goto(AppMode.FishShort);
    await oceans.waitForWordsScene();
    await page.getByRole('button', {name: 'Blue'}).click();
    await oceans.waitForTrainingScene();
    await expect(page.getByText('Is this fish blue?')).toBeVisible();
  });

  test('yes button text matches the selected word', async ({page}) => {
    const oceans = await FishShortPage.load(page, 'Blue');
    await expect(oceans.yesButton).toContainText('Blue');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FishShort — Pond info panel
// ─────────────────────────────────────────────────────────────────────────────

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
    await expect(oceans.infoButton).toHaveAttribute('aria-pressed');
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
