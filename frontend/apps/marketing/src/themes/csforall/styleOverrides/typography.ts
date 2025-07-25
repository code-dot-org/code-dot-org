import {Components, Theme, alpha} from '@mui/material/styles';

export const TYPOGRAPHY_OVERRIDES: Components<Theme>['MuiTypography'] = {
  defaultProps: {
    variantMapping: {
      body3: 'p',
      body4: 'p',
    },
  },
  styleOverrides: {
    root: ({theme}) => ({
      color: theme.palette.text.primary,
      // Paragraph styles
      '&.MuiTypography-body1.paragraph--color-primary, &.MuiTypography-body2.paragraph--color-primary, &.MuiTypography-body3.paragraph--color-primary, &.MuiTypography-body4.paragraph--color-primary':
        {
          color: theme.palette.text.primary,
        },
      '&.MuiTypography-body1.paragraph--color-secondary, &.MuiTypography-body2.paragraph--color-secondary, &.MuiTypography-body3.paragraph--color-secondary, &.MuiTypography-body4.paragraph--color-secondary':
        {
          color: theme.palette.text.secondary,
        },
      '&.MuiTypography-body1.paragraph--color-white, &.MuiTypography-body2.paragraph--color-white, &.MuiTypography-body3.paragraph--color-white, &.MuiTypography-body4.paragraph--color-white':
        {
          color: theme.palette.common.white,
        },
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
      '&.MuiTypography-overline.overline--color-white': {
        color: theme.palette.common.white,
        backgroundColor: alpha(theme.palette.common.white, 0.1),
        border: `1px solid ${theme.palette.common.white}`,
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
    }),
    gutterBottom: ({theme}) => ({
      '&.MuiTypography-body1': {
        marginBottom: theme.spacing(2), // 16px
      },
      '&.MuiTypography-body2': {
        marginBottom: theme.spacing(2), // 16px
      },
      '&.MuiTypography-body3': {
        marginBottom: theme.spacing(1.5), // 12px
      },
      '&.MuiTypography-body4': {
        marginBottom: theme.spacing(1.25), // 10px
      },
      '&.MuiTypography-overline': {
        marginBottom: theme.spacing(2), // 16px
      },
    }),
  },
};
