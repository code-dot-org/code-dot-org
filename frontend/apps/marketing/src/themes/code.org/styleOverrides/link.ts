import {Components, Theme} from '@mui/material/styles';

export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
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
      '& svg': {
        color: 'var(--text-brand-purple-primary)',
        transition: 'color 0.2s ease-in-out',
      },
    },
  },
};
