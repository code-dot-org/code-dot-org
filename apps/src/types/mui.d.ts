/**
 * Apps-specific MUI module augmentations.
 *
 * Design-system-wide augmentations (Button, IconButton, Breadcrumbs)
 * are published from `@code-dot-org/component-library/themes` and pulled
 * in transitively wherever apps imports from that subpath (see
 * `apps/src/util/brand.ts` and the studentSnapshot stories).
 *
 * Only Typography variants live here — they extend MUI's Typography
 * for apps's typography system and are not part of the design-system
 * theme contract.
 */

import {Theme as MuiTheme} from '@mui/material/styles';

type Theme = Omit<MuiTheme, 'components'>;

declare module '@mui/material/styles' {
  interface TypographyVariants {
    body3: React.CSSProperties;
    body4: React.CSSProperties;
    overline1: React.CSSProperties;
    overline2: React.CSSProperties;
    overline3: React.CSSProperties;
    figcaption: React.CSSProperties;
    strong: React.CSSProperties;
    em: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
    body4?: React.CSSProperties;
    overline1?: React.CSSProperties;
    overline2?: React.CSSProperties;
    overline3?: React.CSSProperties;
    figcaption?: React.CSSProperties;
    strong?: React.CSSProperties;
    em?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body3: true;
    body4: true;
    overline: false; // disable the default overline
    overline1: true; // add overline1 variant to match DSCO naming pattern
    overline2: true;
    overline3: true;
    caption: false; // disable the default caption
    figcaption: true; // add figcaption variant to match DSCO naming pattern
    label1: true;
    label2: true;
    label3: true;
    label4: true;
    strong: true;
    em: true;
  }
}

export {};
