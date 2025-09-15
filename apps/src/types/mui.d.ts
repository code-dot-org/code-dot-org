import {Theme as MuiTheme} from '@mui/material/styles';

type Theme = Omit<MuiTheme, 'components'>;

declare module '@mui/material/styles' {
  // Custom Typography definitions
  interface TypographyVariants {
    body3: React.CSSProperties;
    body4: React.CSSProperties;
    overline1: React.CSSProperties;
    overline2: React.CSSProperties;
    overline3: React.CSSProperties;
    figcaption: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
    body4?: React.CSSProperties;
    overline1?: React.CSSProperties;
    overline2?: React.CSSProperties;
    overline3?: React.CSSProperties;
    figcaption?: React.CSSProperties;
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
  }
}

export {};
