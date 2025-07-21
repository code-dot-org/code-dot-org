'use client';
import {createTheme} from '@mui/material';
import {alpha} from '@mui/material/styles';

import {NOTO_FONT} from '@/themes/constants/fonts';

import {createFontStack} from '../common/constants';

const FIGTREE_FONT = 'Figtree';
const ROBOTO_MONO_FONT = 'Roboto Mono';

const COLORS = {
  black: '#15092C',
};

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#2C079F',
    },
    secondary: {
      main: '#CA01E4',
    },
    text: {
      primary: COLORS.black,
    },
    divider: COLORS.black,
    common: {
      black: COLORS.black,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({theme}) => ({
          fontFamily: ROBOTO_MONO_FONT,
          '&:focus-visible': {
            outline: '2px solid ' + theme.palette.primary.main,
            outlineOffset: '2px',
          },
          textTransform: 'none',
          border: '1px solid transparent',
          '&.MuiButton-contained.button--color-emphasized': {
            backgroundColor: theme.palette.secondary.main,
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
            },
          },
          '&.MuiButton-contained.button--color-primary': {
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          },
          '&.MuiButton-outlined.button--color-secondary': {
            color: theme.palette.common.black,
            borderColor: theme.palette.common.black,
            '&:hover': {
              backgroundColor: theme.palette.grey[100],
            },
          },
          '&.MuiButton-contained.MuiButton-sizeSmall, &.MuiButton-outlined.MuiButton-sizeSmall':
            {
              fontSize: '1rem',
              padding: theme.spacing(1.25, 2.5),
              borderRadius: theme.spacing(3),
            },
          '&.MuiButton-contained.MuiButton-sizeMedium, &.MuiButton-outlined.MuiButton-sizeMedium':
            {
              fontSize: '1.125rem',
              padding: theme.spacing(1.5, 3),
              borderRadius: theme.spacing(4),
            },
          '&.MuiButton-contained.MuiButton-sizeLarge, &.MuiButton-outlined.MuiButton-sizeLarge':
            {
              fontSize: '1.25rem',
              padding: theme.spacing(2, 5),
              borderRadius: theme.spacing(8),
            },
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({theme}) => ({
          '&.MuiDivider-root.divider--color-primary': {
            borderColor: theme.palette.divider,
          },
          '&.MuiDivider-root.divider--color-strong': {
            borderColor: theme.palette.divider,
            borderStyle: 'dashed',
          },
          '&.MuiDivider-root.divider--margin-none': {
            marginTop: 0,
            marginBottom: 0,
          },
          '&.MuiDivider-root.divider--margin-xs': {
            marginTop: theme.spacing(3),
            marginBottom: theme.spacing(3),
          },
          '&.MuiDivider-root.divider--margin-s': {
            marginTop: theme.spacing(5),
            marginBottom: theme.spacing(5),
          },
          '&.MuiDivider-root.divider--margin-m': {
            marginTop: theme.spacing(7),
            marginBottom: theme.spacing(7),
          },
          '&.MuiDivider-root.divider--margin-l': {
            marginTop: theme.spacing(8),
            marginBottom: theme.spacing(8),
          },
        }),
      },
    },
    MuiTypography: {
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
    },
  },
  typography: {
    fontFamily: createFontStack(ROBOTO_MONO_FONT, NOTO_FONT),
    h1: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '5rem', // 80px
      fontWeight: 800,
      lineHeight: 1.1,
    },
    h2: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '4rem', // 64px
      fontWeight: 800,
      lineHeight: 1.125,
    },
    h3: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '3.125rem', // 50px
      fontWeight: 800,
      lineHeight: 1.16,
    },
    h4: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '2.5rem', // 40px
      fontWeight: 800,
      lineHeight: 1.2,
    },
    h5: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '2rem', // 32px
      fontWeight: 800,
      lineHeight: 1.125,
    },
    h6: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1.5rem', // 24px
      fontWeight: 800,
      lineHeight: 1.25,
    },
    overline: {
      fontWeight: 400,
      lineHeight: 1.5,
      textTransform: 'none',
    },
  },
});

export default theme;
