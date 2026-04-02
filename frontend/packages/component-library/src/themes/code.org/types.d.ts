/**
 * Type declarations to extend MUI's Button, IconButton, and Breadcrumbs components with custom sizes and colors
 *
 * Now that @mui/material is declared as a peerDependency (not a devDependency),
 * both this package and apps/ resolve to the same physical @mui/material copy.
 * This means TypeScript module augmentations defined here should propagate
 * automatically to apps/ without manual synchronization.
 *
 * NOTE: apps/src/types/mui.d.ts still contains a manually copied version of
 * these augmentations from before this fix. That duplication is harmless but
 * can be cleaned up in a follow-up PR once we confirm everything works.
 */

import '@mui/material/styles';
import '@mui/material/Breadcrumbs';

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

declare module '@mui/material/Breadcrumbs' {
  interface BreadcrumbsOwnProps {
    size?: 'xs' | 's' | 'm' | 'l';
  }
}
