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
    },
  },
  styleOverrides: {
    root: ({theme}) => ({
      color: 'var(--text-neutral-primary)',
    }),
    gutterBottom: ({theme}) => ({
      '&.MuiTypography-h1': {
        marginBottom: theme.spacing(3), // 24px
      },
      '&.MuiTypography-h2': {
        marginBottom: theme.spacing(2.125), // 17px
      },
      '&.MuiTypography-h3': {
        marginBottom: theme.spacing(1.75), // 14px
      },
      '&.MuiTypography-h4': {
        marginBottom: theme.spacing(1.5), // 12px
      },
      '&.MuiTypography-h5': {
        marginBottom: theme.spacing(1.25), // 10px
      },
      '&.MuiTypography-h6': {
        marginBottom: theme.spacing(1), // 8px
      },
      '&.MuiTypography-body1': {
        marginBottom: theme.spacing(2.5), // 20px
      },
      '&.MuiTypography-body2': {
        marginBottom: theme.spacing(2), // 16px
      },
      '&.MuiTypography-body3': {
        marginBottom: theme.spacing(1.75), // 14px
      },
      '&.MuiTypography-body4': {
        marginBottom: theme.spacing(1.625), // 13px
      },
      '&.MuiTypography-overline1': {
        marginBottom: theme.spacing(1.75), // 14px
      },
      '&.MuiTypography-overline2': {
        marginBottom: theme.spacing(1.625), // 13px
      },
      '&.MuiTypography-overline3': {
        marginBottom: theme.spacing(1.375), // 11px
      },
      '&.MuiTypography-figcaption': {
        marginBottom: theme.spacing(1.75), // 14px
      },
    }),
  },
};
