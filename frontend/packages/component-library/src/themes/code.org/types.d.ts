/**
 * Type declarations to extend MUI's Button component with custom sizes and colors
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

  // Extend IconButtonProps to include variant prop
  interface IconButtonProps {
    variant?: 'contained' | 'outlined' | 'text';
  }
}
