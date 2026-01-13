/**
 * Type declarations to extend MUI's Button and IconButton components with custom sizes and colors
 *
 * IMPORTANT: These type augmentations must be manually copied to apps/src/types/mui.d.ts
 * when they change. Right now, TypeScript module augmentation doesn't work across package boundaries
 * in this monorepo setup, so manual synchronization is required.
 *
 * To update apps types:
 * 1. Make changes to this file
 * 2. Copy the Button and IconButton declare module blocks to apps/src/types/mui.d.ts
 * 3. Keep the source reference comment in apps/src/types/mui.d.ts pointing to this file
 *
 * If at any point we find a solution for sharing this without
 * need of manually syncing the types - you're welcome to update this!
 */

import '@mui/material/styles';

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
