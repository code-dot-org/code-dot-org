import {type Locator, type Page} from 'playwright/test';

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

  test.describe('vocabulary definitions', () => {
    // The behaviors a native `title` tooltip could not provide: reachable by
    // keyboard, visible on focus, and dismissible without moving the pointer
    // (WCAG 2.2 SC 1.4.13).
    const DEFINITION = 'Reducing file size by discarding data.';

    /*
     * Tab until `target` holds focus. The definition opens on :focus-visible,
     * which a programmatic .focus() does not satisfy in a real browser after
     * pointer input -- only a keyboard walk does, which is the case worth
     * testing anyway.
     */
    const tabTo = async (page: Page, target: Locator) => {
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        if (await target.evaluate(el => el === document.activeElement)) {
          return;
        }
      }
      throw new Error('never reached the target by tabbing');
    };

    test('shows the definition on hover', async ({page}) => {
      const demo = await DemoPage.load(page);
      await demo.selectScenario('Vocabulary definitions');

      const term = demo.preview.getByText('lossy compression');
      await term.hover();
      await expect(page.getByRole('tooltip')).toHaveText(DEFINITION);

      await page.mouse.move(0, 0);
      await expect(page.getByRole('tooltip')).toBeHidden();
    });

    test('reaches the term by keyboard and shows the definition', async ({
      page,
    }) => {
      const demo = await DemoPage.load(page);
      await demo.selectScenario('Vocabulary definitions');

      const term = demo.preview.getByText('lossy compression');
      await tabTo(page, term);

      await expect(page.getByRole('tooltip')).toHaveText(DEFINITION);
      // The ring the design system draws, not the browser default.
      const outline = await term.evaluate(el => ({
        width: getComputedStyle(el).outlineWidth,
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline).toEqual({width: '2px', style: 'solid'});
    });

    test('dismisses the definition with Escape', async ({page}) => {
      const demo = await DemoPage.load(page);
      await demo.selectScenario('Vocabulary definitions');

      await demo.preview.getByText('lossy compression').hover();
      await expect(page.getByRole('tooltip')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip')).toBeHidden();
    });

    test('leaves an unknown term as plain text', async ({page}) => {
      const demo = await DemoPage.load(page);
      await demo.selectScenario('Vocabulary definitions');

      const unknown = demo.preview.getByText('unknown term');
      await expect(unknown).toHaveCount(1);
      await expect(unknown).not.toHaveAttribute('tabindex', '0');
    });
  });

  test('the sanitization scenario strips scripts', async ({page}) => {
    const demo = await DemoPage.load(page);
    await demo.selectScenario('Sanitization');
    await expect(demo.preview.getByText(/This text is safe/)).toBeVisible();
    await expect(demo.preview.locator('script')).toHaveCount(0);
  });
});
