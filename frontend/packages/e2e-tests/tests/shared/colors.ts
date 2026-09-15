import {type Locator} from '@playwright/test';

/** A computed color property paired with the CSS custom property it should resolve to. */
export interface ColorVarMatch {
  /** A color-valued computed property, e.g. 'background-color'. */
  property: string;
  /** A CSS custom property, e.g. '--background-success-primary'. */
  cssVar: string;
}

/**
 * Whether every match holds: `locator`'s computed `property` equals the resolved
 * value of its `cssVar`. getComputedStyle returns resolved values, not the vars
 * that produced them, so resolve each var via a probe in the element's own theme
 * context and compare rgb() to rgb() — all pairs in a single evaluate.
 */
export async function cssColorsMatchVars({
  locator,
  matches,
}: {
  locator: Locator;
  matches: ColorVarMatch[];
}): Promise<boolean> {
  return locator.evaluate((el, pairs) => {
    const resolve = (cssVar: string): string => {
      const probe = document.createElement('span');
      el.appendChild(probe);
      probe.style.color = `var(${cssVar})`;
      const value = window.getComputedStyle(probe).color;
      probe.remove();
      return value;
    };
    const style = window.getComputedStyle(el);
    return pairs.every(
      ({property, cssVar}) =>
        style.getPropertyValue(property) === resolve(cssVar),
    );
  }, matches);
}
