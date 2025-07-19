'use client';
import {createTheme} from '@mui/material';

import {NOTO_FONT} from '@/themes/constants/fonts';

import {createFontStack} from '../common/constants';

const BARLOW_FONT = 'Barlow Semi Condensed Semibold';
const FIGTREE_FONT = 'Figtree';

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          ['&.MuiButton-contained.MuiButton-colorPrimary']: {
            backgroundColor: 'var(--brand-purple-50)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({theme}) => ({
          ['&.MuiDivider-root.divider--color-primary']: {
            borderColor: 'var(--background-neutral-quaternary)',
          },
          ['&.MuiDivider-root.divider--color-strong']: {
            borderColor: 'var(--background-neutral-senary)',
          },
          ['&.MuiDivider-root.divider--margin-none']: {
            marginTop: 0,
            marginBottom: 0,
          },
          ['&.MuiDivider-root.divider--margin-xs']: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
          },
          ['&.MuiDivider-root.divider--margin-s']: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
          },
          ['&.MuiDivider-root.divider--margin-m']: {
            marginTop: theme.spacing(4),
            marginBottom: theme.spacing(4),
          },
          ['&.MuiDivider-root.divider--margin-l']: {
            marginTop: theme.spacing(8),
            marginBottom: theme.spacing(8),
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: 'var(--text-brand-purple-primary)',
          fontWeight: 500,
          textDecoration: 'underline',
          transition: 'color 0.2s ease-in-out',
          '&:hover': {
            color: 'var(--text-brand-purple-secondary)',
            '& svg': {
              color: 'var(--text-brand-purple-secondary)',
            },
          },
          ['& svg']: {
            color: 'var(--text-brand-purple-primary)',
            transition: 'color 0.2s ease-in-out',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: 'var(--text-neutral-primary)',
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
        }),
      },
    },
  },
  typography: {
    fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
    h1: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '3rem', // 48px
      fontWeight: 500,
      lineHeight: 1.16,
    },
    h2: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '2.125rem', // 34px
      fontWeight: 500,
      lineHeight: 1.24,
    },
    h3: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '1.75rem', // 28px
      fontWeight: 500,
      lineHeight: 1.28,
    },
    h4: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '1.5rem', // 24px
      fontWeight: 500,
      lineHeight: 1.32,
    },
    h5: {
      fontSize: '1.25rem', // 20px
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.48,
    },
    overline: {
      letterSpacing: '0.03rem', // 0.48px
      lineHeight: 1.4,
    },
  },
});

export default theme;
