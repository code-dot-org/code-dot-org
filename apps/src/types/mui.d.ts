/**
 * MUI type overrides for apps
 *
 * IMPORTANT: This file contains manually copied type augmentations from:
 *   frontend/packages/component-library/src/themes/code.org/types.d.ts
 *
 * When Button/IconButton type augmentations change in component-library,
 * they must be manually copied here to keep apps in sync.
 *
 * This file also includes apps-specific Typography type augmentations.
 */

import {Theme as MuiTheme} from '@mui/material/styles';
import '@mui/material/Button';
import '@mui/material/IconButton';

type Theme = Omit<MuiTheme, 'components'>;

// Apps-specific Typography type augmentations
declare module '@mui/material/styles' {
  // Custom Typography definitions
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
    strong: true;
    em: true;
  }
}

// Button and IconButton type augmentations (manually copied from component-library)
// Source: frontend/packages/component-library/src/themes/code.org/types.d.ts
declare module '@mui/material/Button' {
  interface ButtonPropsSizeOverrides {
    extraSmall: true;
    small: true;
    medium: true;
    large: true;
  }

  interface ButtonPropsColorOverrides {
    white: true;
    tertiary: true;
  }
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsSizeOverrides {
    extraSmall: true;
    small: true;
    medium: true;
    large: true;
  }

  interface IconButtonPropsColorOverrides {
    white: true;
    tertiary: true;
  }

  interface IconButtonPropsVariantOverrides {
    contained: true;
    outlined: true;
    text: true;
  }

  // Extend IconButtonOwnProps to include variant prop
  interface IconButtonOwnProps {
    variant?: 'contained' | 'outlined' | 'text';
  }
}

export {};
