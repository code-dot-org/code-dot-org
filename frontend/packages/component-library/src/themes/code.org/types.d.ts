/**
 * Type declarations to extend MUI's Button, IconButton, and Breadcrumbs components with custom sizes and colors
 *
 * IMPORTANT: These type augmentations must be manually copied to apps/src/types/mui.d.ts
 * when they change. TypeScript module augmentations don't propagate across package
 * boundaries (they are scoped to the tsconfig that includes them), so manual
 * synchronization is required even though @mui/material is a peerDependency.
 *
 * To update apps types:
 * 1. Make changes to this file
 * 2. Copy the Button, IconButton, and Breadcrumbs declare module blocks to apps/src/types/mui.d.ts
 * 3. Keep the source reference comment in apps/src/types/mui.d.ts pointing to this file
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
