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
}

// Extend IconButton props to allow data attributes for variant matching
declare module '@mui/material' {
  interface IconButtonProps {
    'data-type'?: 'primary' | 'secondary' | 'tertiary';
    'data-color'?: 'purple' | 'black' | 'gray' | 'white' | 'destructive';
    'data-size'?: 'xs' | 's' | 'm' | 'l';
    'data-force-hover'?: boolean;
  }
}
