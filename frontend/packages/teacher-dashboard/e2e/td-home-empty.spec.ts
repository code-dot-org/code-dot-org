import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';

import {
  assertReachableWithVisibleFocus,
  focusableElements,
} from './helpers/keyboard';
import {settle} from './helpers/settle';

// Region root per visual-artifacts.md (TD-HOME-EMPTY candidate selector).
const REGION_SELECTOR = '#teacher-dashboard-home[data-state="empty"]';

test.describe('TD-HOME-EMPTY', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/?tag=empty');
    await expect(page.locator(REGION_SELECTOR)).toBeVisible();
  });

  test('renders the empty-state headline, description, and image with no section list', async ({
    page,
  }) => {
    const region = page.locator(REGION_SELECTOR);
    await expect(region.getByRole('heading')).toHaveCount(1);
    await expect(region.locator('img')).toHaveCount(1);
    await expect(
      page.locator('ol#teacher-dashboard-home-section-list'),
    ).toHaveCount(0);
  });

  test('has no axe violations in the empty region', async ({page}) => {
    await settle(page);
    const results = await new AxeBuilder({page})
      .include(REGION_SELECTOR)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('every focusable element in the region is reachable with a visible focus indicator', async ({
    page,
  }) => {
    const region = page.locator(REGION_SELECTOR);
    const elements = await focusableElements(region);
    // EmptyHome is read-only (headline/description/decorative image only —
    // see design.md D5 / proposal Out of Scope): zero focusable elements is
    // the intended, asserted shape, not an untested gap.
    expect(elements).toHaveLength(0);
    for (const element of elements) {
      await assertReachableWithVisibleFocus(element);
    }
  });

  test('candidate self-consistency: empty region visual baseline', async ({
    page,
  }) => {
    await settle(page);
    await expect(page.locator(REGION_SELECTOR)).toHaveScreenshot(
      'td-home-empty.png',
    );
  });
});
