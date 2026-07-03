import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';

import {
  assertReachableWithVisibleFocus,
  focusableElements,
} from './helpers/keyboard';
import {settle} from './helpers/settle';

// Tight visual bound per visual-artifacts.md (TD-HOME-SECTION-LIST candidate
// selector); the region ROOT (incl. the visually-hidden region heading) is the
// axe/a11y scope — axe page-level and heading-order rules see nothing when
// scoped to the bare <ol>.
const REGION_SELECTOR = 'ol#teacher-dashboard-home-section-list';
const REGION_ROOT_SELECTOR = '#teacher-dashboard-home[data-state="list"]';

test.describe('TD-HOME-SECTION-LIST', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/?tag=list');
    await expect(page.locator(REGION_SELECTOR)).toBeVisible();
  });

  test('exposes the section list as role=list with 2 items', async ({page}) => {
    const list = page.getByRole('list');
    await expect(list).toHaveCount(1);
    await expect(list.getByRole('listitem')).toHaveCount(2);
  });

  test('the assigned and unassigned cards show correct read-only summaries', async ({
    page,
  }) => {
    const items = page.locator(REGION_SELECTOR).getByRole('listitem');

    const unassigned = items.filter({hasText: 'Period 1'});
    await expect(unassigned).toContainText('0 students');
    await expect(unassigned).toContainText('No course assigned');

    const assigned = items.filter({hasText: 'Period 2'});
    await expect(assigned).toContainText('1 student');
    await expect(assigned).toContainText('Single-Unit Course 2026');
  });

  test('renders no mutating control', async ({page}) => {
    const region = page.locator(REGION_ROOT_SELECTOR);
    await expect(region.getByRole('button')).toHaveCount(0);
    await expect(region.getByRole('link')).toHaveCount(0);
    await expect(region.getByRole('combobox')).toHaveCount(0);
  });

  test('nests card headings under a single region-level h2', async ({page}) => {
    const region = page.locator(REGION_ROOT_SELECTOR);
    await expect(region.getByRole('heading', {level: 2})).toHaveCount(1);
    await expect(region.getByRole('heading', {level: 3})).toHaveCount(2);
  });

  test('has no axe violations in the section-list region', async ({page}) => {
    await settle(page);
    const results = await new AxeBuilder({page})
      .include(REGION_ROOT_SELECTOR)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('every focusable element in the region is reachable with a visible focus indicator', async ({
    page,
  }) => {
    const region = page.locator(REGION_ROOT_SELECTOR);
    const elements = await focusableElements(region);
    // SectionCard is read-only (no create/edit/archive/delete/reorder/
    // add-students/assign-course control — see design.md D5 / R4): zero
    // focusable elements is the intended, asserted shape, not an untested
    // gap.
    expect(elements).toHaveLength(0);
    for (const element of elements) {
      await assertReachableWithVisibleFocus(element);
    }
  });

  test('candidate self-consistency: section-list region visual baseline', async ({
    page,
  }) => {
    await settle(page);
    await expect(page.locator(REGION_SELECTOR)).toHaveScreenshot(
      'td-home-section-list.png',
    );
  });
});
