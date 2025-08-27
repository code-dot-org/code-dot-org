import {Components, Theme, alpha} from '@mui/material/styles';

export const CONTAINER_OVERRIDES: Components<Theme>['MuiContainer'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.MuiContainer-root': {
        paddingLeft: theme.spacing(0),
        paddingRight: theme.spacing(0),
        zIndex: 2,
      },
      // Spacing styles
      '&.MuiContainer-root.container--spacing-l': {
        paddingTop: theme.spacing(7),
        paddingBottom: theme.spacing(7),
      },
      '&.MuiContainer-root.container--spacing-m': {
        paddingTop: theme.spacing(5),
        paddingBottom: theme.spacing(5),
      },
      '&.MuiContainer-root.container--spacing-none': {
        paddingTop: theme.spacing(0),
        paddingBottom: theme.spacing(0),
      },
      // Background styles
      '.section-background-primary:has(&.MuiContainer-root)': {
        backgroundColor: theme.palette.common.white,
      },
      '.section-background-secondary:has(&.MuiContainer-root)': {
        backgroundColor: theme.palette.background.default,
      },
      '.section-background-dark:has(&.MuiContainer-root)': {
        backgroundColor: theme.palette.common.black,
      },
      '.section-background-brandPrimary:has(&.MuiContainer-root)': {
        backgroundColor: theme.palette.primary.main,
      },
      '.section-background-brandLightPrimary:has(&.MuiContainer-root)': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      },
      '.section-background-brandSecondary:has(&.MuiContainer-root)': {
        backgroundColor: theme.palette.secondary.main,
      },
      '.section-background-brandLightSecondary:has(&.MuiContainer-root)': {
        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
      },
      '.section-background-brandTertiary:has(&.MuiContainer-root)': {
        backgroundColor: theme.palette.tertiary.main,
      },
      '.section-background-brandLightTertiary:has(&.MuiContainer-root)': {
        backgroundColor: alpha(theme.palette.tertiary.main, 0.1),
      },
    }),
  },
};
