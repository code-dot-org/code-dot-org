import type {ReactNode} from 'react';

import type {Brand} from '@code-dot-org/core';

/** Legal name and trademark ReactNode keyed to a specific brand. */
export interface BrandConfig {
  /** Legal name for copyright lines and any future brand-name reads. */
  legalName: string;
  /**
   * Brand trademark line as a ReactNode — the current year is wrapped in a
   * stable `data-testid="current-year"` span at the source, keeping that
   * invariant out of every consumer.
   */
  trademark: ReactNode;
}

/**
 * Returns the brand-specific content for the studio footer.
 * The `default:` clause renders Code.org content as the M5 fallback for any
 * future Brand union expansion that lands before this switch is updated.
 *
 * @param brand - The active brand from `SiteConfig.brand`.
 * @returns A BrandConfig for the given brand.
 */
export function getBrandConfig(brand: Brand): BrandConfig {
  const currentYear = (
    <span data-testid="current-year">{new Date().getFullYear()}</span>
  );
  switch (brand) {
    case 'aiday':
      return {
        legalName: 'AIDay',
        trademark: (
          <>
            © AIDay, {currentYear}. AIDay®, the CODE logo, Hour of Code® and
            CS Discoveries® are trademarks of AIDay.
          </>
        ),
      };
    case 'code.org':
    default:
      return {
        legalName: 'Code.org',
        trademark: (
          <>
            © Code.org, {currentYear}. Code.org®, the CODE logo, Hour of
            Code® and CS Discoveries® are trademarks of Code.org.
          </>
        ),
      };
  }
}
