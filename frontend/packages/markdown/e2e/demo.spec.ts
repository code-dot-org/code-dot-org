import {expect, test} from './fixtures/visual';
import {DemoPage} from './poms/DemoPage';

test.describe('Markdown demo shell', () => {
  test('renders the scenario picker', async ({page}) => {
    await DemoPage.load(page);
    await expect(page.getByRole('radio', {name: 'Basic'})).toBeVisible();
    await expect(page.getByRole('radio', {name: 'Callout'})).toBeVisible();
  });

  test('renders the Basic scenario by default', async ({page}) => {
    const demo = await DemoPage.load(page);
    await expect(
      demo.preview.getByRole('heading', {name: 'Heading 1'}),
    ).toBeVisible();
  });

  test('selecting a scenario swaps the preview', async ({page}) => {
    const demo = await DemoPage.load(page);
    await demo.selectScenario('Callout');
    await expect(demo.preview.getByText('Heads up — a callout.')).toBeVisible();
  });

  test('the dark-mode toggle flips the preview theme', async ({page}) => {
    const demo = await DemoPage.load(page);
    await expect(demo.preview).toHaveAttribute('data-theme', 'Light');
    await demo.setDarkMode(true);
    await expect(demo.preview).toHaveAttribute('data-theme', 'Dark');
  });

  test('the sanitization scenario strips scripts', async ({page}) => {
    const demo = await DemoPage.load(page);
    await demo.selectScenario('Sanitization');
    await expect(demo.preview.getByText(/This text is safe/)).toBeVisible();
    await expect(demo.preview.locator('script')).toHaveCount(0);
  });
});
