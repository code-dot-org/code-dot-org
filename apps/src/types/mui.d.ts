/**
 * MUI type overrides for apps
 *
 * This file contains type augmentations that were manually copied from:
 *   frontend/packages/component-library/src/themes/code.org/types.d.ts
 *
 * Now that @mui/material is a peerDependency of the component-library (rather
 * than a devDependency), both packages resolve to the same physical MUI copy.
 * This means the augmentations from the component-library should propagate
 * automatically, and the manually copied Button/IconButton/Breadcrumbs
 * augmentations below may no longer be necessary. They are kept for now and
 * can be cleaned up in a follow-up PR.
 *
 * This file also includes apps-specific Typography type augmentations.
 */

import {Theme as MuiTheme} from '@mui/material/styles';
import '@mui/material/Button';
import '@mui/material/IconButton';
import '@mui/material/Breadcrumbs';

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
    label1: true;
    label2: true;
    label3: true;
    label4: true;
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

// Breadcrumbs type augmentations
declare module '@mui/material/Breadcrumbs' {
  interface BreadcrumbsOwnProps {
    size?: 'xs' | 's' | 'm' | 'l';
  }
}

export {};
