import type {ReactNode} from 'react';

import type {Brand} from '@code-dot-org/core';

// Evaluated once at module load — the year never changes at runtime.
const CURRENT_YEAR = new Date().getFullYear();

/** Per-brand display text used in footer copyright and legal lines. */
export interface BrandConfig {
  /**
   * Short copyright line rendered in the footer right column: "© Brand, Year".
   */
  copyright: ReactNode;
  /**
   * Full trademark notice: "© Brand, Year. Brand®, the CODE logo…"
   */
  trademark: ReactNode;
  /**
   * Full fineprint block: vendor attributions + trademark + GitHub credit.
   * Centralised here so legal copy is discoverable and not buried in a component.
   */
  fineprint: ReactNode;
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
  switch (brand) {
    case 'aiday': {
      const trademark = (
        <>
          © AIDay, {CURRENT_YEAR}. AIDay®, the CODE logo, Hour of Code® and
          CS Discoveries® are trademarks of AIDay.
        </>
      );
      return {
        copyright: <>© AIDay, {CURRENT_YEAR}</>,
        trademark,
        fineprint: buildFineprint(trademark),
      };
    }
    case 'code.org':
    default: {
      const trademark = (
        <>
          © Code.org, {CURRENT_YEAR}. Code.org®, the CODE logo, Hour of Code®
          and CS Discoveries® are trademarks of Code.org.
        </>
      );
      return {
        copyright: <>© Code.org, {CURRENT_YEAR}</>,
        trademark,
        fineprint: buildFineprint(trademark),
      };
    }
  }
}

/**
 * Compose the full fineprint block from the brand-specific trademark line.
 * Vendor attributions and GitHub credit are brand-agnostic.
 */
function buildFineprint(trademark: ReactNode): ReactNode {
  return (
    <>
      Engineers from Amazon, Google, and Microsoft helped create these
      materials.
      <br />
      Minecraft™ © Microsoft. All Rights Reserved. Star Wars™ © Disney and
      Lucasfilm. All Rights Reserved. Frozen™ © Disney. All Rights Reserved.
      Ice Age™ © 20th Century Fox. All Rights Reserved. Angry Birds ©
      2009-2026 Rovio Entertainment Ltd. All Rights Reserved. Plants vs.
      Zombies™ © Electronic Arts Inc. All Rights Reserved. DreamWorks The Bad
      Guys © DreamWorks Animation LLC. All Rights Reserved. Paramount Pictures
      Transformers One © Paramount Pictures. All Rights Reserved.
      <br />
      {trademark}
      <br />
      Built on GitHub from Microsoft
    </>
  );
}
