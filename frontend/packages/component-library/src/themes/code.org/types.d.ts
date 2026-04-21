/**
 * MUI type overrides for apps
 *
 * IMPORTANT: This file contains manually copied type augmentations from:
 *   frontend/packages/component-library/src/themes/code.org/types.d.ts
 *
 * When Button/IconButton/Breadcrumbs or any other Mui component type augmentations change in component-library,
 * they must be manually copied here to keep apps in sync.
 *
 * This file also includes apps-specific Typography type augmentations.
 */

import '@mui/material/styles';
import '@mui/material/Button';
import '@mui/material/IconButton';
import '@mui/material/Breadcrumbs';

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
