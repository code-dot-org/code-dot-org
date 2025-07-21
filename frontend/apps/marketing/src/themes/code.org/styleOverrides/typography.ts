import {Components, Theme} from '@mui/material/styles';

export const TYPOGRAPHY_OVERRIDES: Components<Theme>['MuiTypography'] = {
  styleOverrides: {
    root: {
      color: 'var(--text-neutral-primary)',
      // Overline styles
      '&.MuiTypography-overline.overline--color-primary': {
        color: 'var(--text-brand-teal-primary)',
      },
      '&.MuiTypography-overline.overline--color-secondary': {
        color: 'var(--text-neutral-quaternary)',
      },
      '&.MuiTypography-overline.overline--size-s': {
        fontSize: '0.625rem', // 10px
      },
      '&.MuiTypography-overline.overline--size-m': {
        fontSize: '0.75rem', // 12px
      },
      '&.MuiTypography-overline.overline--size-l': {
        fontSize: '0.875rem', // 14px
      },
      // End Overline styles
    },
    gutterBottom: ({theme}) => ({
      '&.MuiTypography-h1': {
        marginBottom: theme.spacing(3), // 24px
      },
      '&.MuiTypography-h2': {
        marginBottom: theme.spacing(2.125), // 16px
      },
      '&.MuiTypography-h3': {
        marginBottom: theme.spacing(1.75), // 14px
      },
      '&.MuiTypography-h4': {
        marginBottom: theme.spacing(1.5), // 12px
      },
      '&.MuiTypography-h5': {
        marginBottom: theme.spacing(1.125), // 10px
      },
      '&.MuiTypography-h6': {
        marginBottom: theme.spacing(1), // 8px
      },
      '&.MuiTypography-overline': {
        marginBottom: theme.spacing(2), // 16px
      },
    }),
  },
};
