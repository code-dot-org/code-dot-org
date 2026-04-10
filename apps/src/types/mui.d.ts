/**
 * Type declarations to extend MUI's Button, IconButton, and Breadcrumbs components with custom sizes and colors
 *
 * IMPORTANT: These type augmentations must be manually copied to apps/src/types/mui.d.ts
 * when they change. Right now, TypeScript module augmentation doesn't work across package boundaries
 * in this monorepo setup, so manual synchronization is required.
 *
 * To update apps types:
 * 1. Make changes to this file
 * 2. Copy the Button, IconButton, and Breadcrumbs declare module blocks to apps/src/types/mui.d.ts
 * 3. Keep the source reference comment in apps/src/types/mui.d.ts pointing to this file
 *
 * If at any point we find a solution for sharing this without
 * need of manually syncing the types - you're welcome to update this!
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

  // MUI Button renders as <a> when href is provided, but the base
  // ButtonProps don't include anchor attributes. Add them here.
  interface ButtonOwnProps {
    target?: string;
    rel?: string;
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
