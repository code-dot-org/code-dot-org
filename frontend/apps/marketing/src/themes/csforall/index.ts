'use client';
import {createTheme} from '@mui/material';

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
          ['&:focus-visible']: {
            outline: '2px solid ' + theme.palette.primary.main,
            outlineOffset: '2px',
          },
          textTransform: 'none',
          border: '1px solid transparent',
          ['&.MuiButton-contained.button--color-emphasized']: {
            backgroundColor: theme.palette.secondary.main,
            ['&:hover']: {
              backgroundColor: theme.palette.secondary.dark,
            },
          },
          ['&.MuiButton-contained.button--color-primary']: {
            backgroundColor: theme.palette.primary.main,
            ['&:hover']: {
              backgroundColor: theme.palette.primary.dark,
            },
          },
          ['&.MuiButton-outlined.button--color-secondary']: {
            color: theme.palette.common.black,
            borderColor: theme.palette.common.black,
            ['&:hover']: {
              backgroundColor: theme.palette.grey[100],
            },
          },
          ['&.MuiButton-contained.MuiButton-sizeSmall, &.MuiButton-outlined.MuiButton-sizeSmall']:
            {
              fontSize: '1rem',
              padding: theme.spacing(1.25, 2.5),
              borderRadius: theme.spacing(3),
            },
          ['&.MuiButton-contained.MuiButton-sizeMedium, &.MuiButton-outlined.MuiButton-sizeMedium']:
            {
              fontSize: '1.125rem',
              padding: theme.spacing(1.5, 3),
              borderRadius: theme.spacing(4),
            },
          ['&.MuiButton-contained.MuiButton-sizeLarge, &.MuiButton-outlined.MuiButton-sizeLarge']:
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
          ['&.MuiDivider-root.divider--color-primary']: {
            borderColor: theme.palette.divider,
          },
          ['&.MuiDivider-root.divider--color-strong']: {
            borderColor: theme.palette.divider,
            borderStyle: 'dashed',
          },
          ['&.MuiDivider-root.divider--margin-none']: {
            marginTop: 0,
            marginBottom: 0,
          },
          ['&.MuiDivider-root.divider--margin-xs']: {
            marginTop: theme.spacing(3),
            marginBottom: theme.spacing(3),
          },
          ['&.MuiDivider-root.divider--margin-s']: {
            marginTop: theme.spacing(5),
            marginBottom: theme.spacing(5),
          },
          ['&.MuiDivider-root.divider--margin-m']: {
            marginTop: theme.spacing(7),
            marginBottom: theme.spacing(7),
          },
          ['&.MuiDivider-root.divider--margin-l']: {
            marginTop: theme.spacing(8),
            marginBottom: theme.spacing(8),
          },
        }),
      },
    },
  },
});

export default theme;
