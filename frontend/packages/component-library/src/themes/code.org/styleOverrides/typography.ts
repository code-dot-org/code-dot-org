import {Components, Theme} from '@mui/material/styles';

export const TYPOGRAPHY_OVERRIDES: Components<Theme>['MuiTypography'] = {
  defaultProps: {
    variantMapping: {
      body3: 'p',
      body4: 'p',
      overline1: 'p',
      overline2: 'p',
      overline3: 'p',
      figcaption: 'figcaption',
      em: 'em',
      strong: 'strong',
    },
  },
  styleOverrides: {
    root: () => ({
      color: 'var(--text-neutral-primary)',

      // when Typography is used as a wrapper (component="div")
      '&:where(div)': {
        '& :is(p, ul, ol, li, h1, h2, h3, h4, h5, h6, span)': {
          font: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          lineHeight: 'inherit',
          color: 'inherit',
        },
      },
    }),
    gutterBottom: ({theme}) => ({
      '&:where(.MuiTypography-h1)': {
        marginBottom: theme.spacing(3), // 24px
      },
      '&:where(.MuiTypography-h2)': {
        marginBottom: theme.spacing(2.125), // 17px
      },
      '&:where(.MuiTypography-h3)': {
        marginBottom: theme.spacing(1.75), // 14px
      },
      '&:where(.MuiTypography-h4)': {
        marginBottom: theme.spacing(1.5), // 12px
      },
      '&:where(.MuiTypography-h5)': {
        marginBottom: theme.spacing(1.25), // 10px
      },
      '&:where(.MuiTypography-h6)': {
        marginBottom: theme.spacing(1), // 8px
      },
      '&:where(.MuiTypography-body1)': {
        marginBottom: theme.spacing(2.5), // 20px
      },
      '&:where(.MuiTypography-body2)': {
        marginBottom: theme.spacing(2), // 16px
      },
      '&:where(.MuiTypography-body3)': {
        marginBottom: theme.spacing(1.75), // 14px
      },
      '&:where(.MuiTypography-body4)': {
        marginBottom: theme.spacing(1.625), // 13px
      },
      '&:where(.MuiTypography-overline1)': {
        marginBottom: theme.spacing(1.75), // 14px
      },
      '&:where(.MuiTypography-overline2)': {
        marginBottom: theme.spacing(1.625), // 13px
      },
      '&:where(.MuiTypography-overline3)': {
        marginBottom: theme.spacing(1.375), // 11px
      },
      '&:where(.MuiTypography-figcaption)': {
        marginBottom: theme.spacing(1.75), // 14px
      },
    }),
  },
};
