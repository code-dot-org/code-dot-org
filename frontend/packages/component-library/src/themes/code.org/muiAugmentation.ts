/**
 * Design-system MUI module augmentations: Button, IconButton, and
 * Breadcrumbs custom sizes, colors, and variants; anchor attrs on
 * ButtonOwnProps; Typography variants matching the design-system type scale;
 * and the MuiFooter custom component slot declarations.
 */

import '@mui/material/Button';
import '@mui/material/IconButton';
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

// Augment the barrel, not '@mui/material/Button': ButtonOwnProps is
// defined in the sub-module and re-exported, and the subpath
// augmentation doesn't merge under node16 resolution.
declare module '@mui/material' {
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

  interface IconButtonOwnProps {
    variant?: 'contained' | 'outlined' | 'text';
  }
}

declare module '@mui/material/Breadcrumbs' {
  interface BreadcrumbsOwnProps {
    size?: 'xs' | 's' | 'm' | 'l';
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    body3: React.CSSProperties;
    body4: React.CSSProperties;
    overline1: React.CSSProperties;
    overline2: React.CSSProperties;
    overline3: React.CSSProperties;
    figcaption: React.CSSProperties;
    label1: React.CSSProperties;
    label2: React.CSSProperties;
    label3: React.CSSProperties;
    label4: React.CSSProperties;
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
    label1?: React.CSSProperties;
    label2?: React.CSSProperties;
    label3?: React.CSSProperties;
    label4?: React.CSSProperties;
    strong?: React.CSSProperties;
    em?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body3: true;
    body4: true;
    overline: false; // disable the default overline
    overline1: true;
    overline2: true;
    overline3: true;
    caption: false; // disable the default caption
    figcaption: true;
    label1: true;
    label2: true;
    label3: true;
    label4: true;
    strong: true;
    em: true;
  }
}

import type {CSSInterpolation} from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Components {
    MuiFooter?: {
      styleOverrides?: {
        root?: CSSInterpolation;
        grid?: CSSInterpolation;
        links?: CSSInterpolation;
        link?: CSSInterpolation;
        localeSelect?: CSSInterpolation;
        copyright?: CSSInterpolation;
        fineprint?: CSSInterpolation;
        imageLink?: CSSInterpolation;
      };
    };
  }
}

// Sentinel type so the `export type * from` re-export in ./index.ts
// has a named target. The augmentations themselves apply globally.
export type DesignSystemMuiAugmentations = void;
