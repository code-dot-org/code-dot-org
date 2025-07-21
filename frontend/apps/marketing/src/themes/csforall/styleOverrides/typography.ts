import {Components, Theme, alpha} from '@mui/material/styles';

export const TYPOGRAPHY_OVERRIDES: Components<Theme>['MuiTypography'] = {
  styleOverrides: {
    root: ({theme}) => ({
      color: theme.palette.text.primary,
      // Overline styles
      '&.MuiTypography-overline': {
        display: 'inline-block',
        paddingBlock: theme.spacing(0.5), // 4px
        paddingInline: theme.spacing(1), // 8px
        borderRadius: 8,
      },
      '&.MuiTypography-overline.overline--color-primary': {
        color: theme.palette.primary.main,
        border: `1px solid ${theme.palette.primary.main}`,
      },
      '&.MuiTypography-overline.overline--color-secondary': {
        color: theme.palette.secondary.dark,
        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        border: `1px solid ${theme.palette.secondary.dark}`,
      },
      '&.MuiTypography-overline.overline--size-s': {
        fontSize: '0.75rem', // 12px
      },
      '&.MuiTypography-overline.overline--size-m': {
        fontSize: '0.875rem', // 14px
      },
      '&.MuiTypography-overline.overline--size-l': {
        fontSize: '1rem', // 16px
      },
      // End Overline styles
    }),
    gutterBottom: ({theme}) => ({
      '&.MuiTypography-overline': {
        marginBottom: theme.spacing(2), // 16px
      },
    }),
  },
};
