import {expect, type Locator} from '@playwright/test';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** All focusable descendants of `region`, in DOM order. */
export async function focusableElements(region: Locator): Promise<Locator[]> {
  const all = region.locator(FOCUSABLE_SELECTOR);
  const count = await all.count();
  return Array.from({length: count}, (_, i) => all.nth(i));
}

/**
 * Tabs to `element` and asserts it is reachable and shows a visible focus
 * indicator (outline or box-shadow — themed components may use either).
 */
export async function assertReachableWithVisibleFocus(
  element: Locator,
): Promise<void> {
  await element.focus();
  await expect(element).toBeFocused();

  const {outlineStyle, outlineWidth, boxShadow} = await element.evaluate(el => {
    const style = getComputedStyle(el);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    };
  });
  const hasVisibleOutline =
    outlineStyle !== 'none' && parseFloat(outlineWidth) > 0;
  const hasVisibleBoxShadow = boxShadow !== 'none';
  expect(
    hasVisibleOutline || hasVisibleBoxShadow,
    'expected a visible :focus-visible indicator (outline or box-shadow)',
  ).toBe(true);
}
