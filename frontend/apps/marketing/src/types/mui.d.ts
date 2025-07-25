import {
  ComponentsOverrides,
  ComponentsVariants,
  Theme as MuiTheme,
} from '@mui/material/styles';

import {ImageProps} from '@/components/contentful/image';

type Theme = Omit<MuiTheme, 'components'>;

declare module '@mui/material/styles' {
  // Custom Palette definitions
  interface Palette {
    tertiary: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }

  // Custom Typography definitions
  interface TypographyVariants {
    body3: React.CSSProperties;
    body4: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
    body4?: React.CSSProperties;
  }

  // Custom components definitions
  interface ComponentNameToClassKey {
    MuiImage: 'root' | 'imageElement';
  }

  interface ComponentsPropsList {
    MuiImage: Partial<ImageProps>;
  }

  interface Components {
    MuiImage?: {
      defaultProps?: ComponentsPropsList['MuiImage'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiImage'];
      variants?: ComponentsVariants['MuiImage'];
    };
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body3: true;
    body4: true;
  }
}

export {};
