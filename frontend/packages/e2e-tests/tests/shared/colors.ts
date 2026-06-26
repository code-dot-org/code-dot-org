import {type Locator} from '@playwright/test';

interface CssColorMatchesVarOptions {
  locator: Locator;
  /** A color-valued computed property, e.g. 'background-color'. */
  colorProperty: string;
  /** A CSS custom property, e.g. '--background-success-primary'. */
  cssVar: string;
}

/**
 * Whether `locator`'s computed `colorProperty` equals the resolved value of
 * `cssVar`. Playwright cannot compare a computed style against a variable —
 * getComputedStyle returns the resolved value, not the var that produced it —
 * so resolve the var via a probe in the element's own theme context and compare
 * rgb() to rgb().
 */
export async function cssColorMatchesVar({
  locator,
  colorProperty,
  cssVar,
}: CssColorMatchesVarOptions): Promise<boolean> {
  return locator.evaluate(
    (el, {colorProperty, cssVar}) => {
      const probe = document.createElement('span');
      el.appendChild(probe);
      probe.style.color = `var(${cssVar})`;
      const expected = window.getComputedStyle(probe).color;
      probe.remove();
      const actual = window
        .getComputedStyle(el)
        .getPropertyValue(colorProperty);
      return actual === expected;
    },
    {colorProperty, cssVar},
  );
}
