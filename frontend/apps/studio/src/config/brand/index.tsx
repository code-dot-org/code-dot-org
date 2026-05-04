import type {ReactNode} from 'react';

import type {Brand} from '@code-dot-org/core';

/** Per-brand display text used in footer copyright and legal lines. */
export interface BrandConfig {
  /** Legal entity name. */
  legalName: string;
  /**
   * Short copyright line rendered in the footer right column: "© Brand, Year".
   * The year is wrapped in `<span data-testid="current-year">` for test targeting.
   */
  copyright: ReactNode;
  /**
   * Full trademark notice for the fineprint block:
   * "© Brand, Year. Brand®, the CODE logo…"
   */
  trademark: ReactNode;
}

/**
 * Return display content for the given brand.
 * The `default:` clause renders Code.org content so future Brand union
 * additions don't break until this switch is updated.
 *
 * @param brand - The active brand from SiteConfig.
 * @returns {@link BrandConfig}
 */
export function getBrandConfig(brand: Brand): BrandConfig {
  const currentYear = (
    <span data-testid="current-year">{new Date().getFullYear()}</span>
  );

  switch (brand) {
    case 'aiday':
      return {
        legalName: 'AIDay',
        copyright: <>© AIDay, {currentYear}</>,
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
        copyright: <>© Code.org, {currentYear}</>,
        trademark: (
          <>
            © Code.org, {currentYear}. Code.org®, the CODE logo, Hour of
            Code® and CS Discoveries® are trademarks of Code.org.
          </>
        ),
      };
  }
}
