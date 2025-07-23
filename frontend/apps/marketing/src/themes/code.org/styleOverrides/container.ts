import {Components, Theme} from '@mui/material/styles';

export const CONTAINER_OVERRIDES: Components<Theme>['MuiContainer'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.MuiContainer-root': {
        maxWidth: '960px',
        paddingLeft: theme.spacing(0),
        paddingRight: theme.spacing(0),
        zIndex: 2,
      },
      // Spacing styles
      '&.MuiContainer-root.container--spacing-l': {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(8),
      },
      '&.MuiContainer-root.container--spacing-m': {
        marginTop: theme.spacing(5),
        marginBottom: theme.spacing(5),
      },
      // Divider styles
      '&.MuiContainer-root.container--divider-primary': {
        borderBottom: `1px solid var(--background-neutral-quaternary)`,
        marginBottom: 0,
      },
      '&.MuiContainer-root.container--divider-strong': {
        borderBottom: `1px solid var(--background-neutral-senary)`,
        marginBottom: 0,
      },
      '&.MuiContainer-root.container--spacing-l.container--divider-primary, &.MuiContainer-root.container--spacing-l.container--divider-strong':
        {
          paddingBottom: theme.spacing(8),
        },
      '&.MuiContainer-root.container--spacing-m.container--divider-primary, &.MuiContainer-root.container--spacing-m.container--divider-strong':
        {
          paddingBottom: theme.spacing(5),
        },
      // Background styles
      '.section-background-primary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-neutral-primary)',
      },
      '.section-background-secondary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-neutral-secondary)',
      },
      '.section-background-dark:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-neutral-black-fixed)',
      },
      '.section-background-brandLightPrimary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-brand-teal-extra-light)',
      },
      '.section-background-brandLightSecondary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-brand-purple-extra-light)',
      },
      '.section-background-patternDark:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--background-neutral-black-fixed)',
      },
      '.section-background-patternPrimary:has(&.MuiContainer-root)': {
        backgroundColor: 'var(--brand-teal-50)',
      },
      '.section-background-transparent:has(&.MuiContainer-root)': {
        backgroundColor: undefined,
      },
    }),
  },
};
