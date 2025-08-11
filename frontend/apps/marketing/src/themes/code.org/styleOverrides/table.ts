import {Components, Theme} from '@mui/material/styles';

// Empty template for table component overrides in MUI theme.
export const TABLE_OVERRIDES: Components<Theme>['MuiTable'] = {
  styleOverrides: {
    root: () => ({}),
  },
};

export const TABLE_CELL_OVERRIDES: Components<Theme>['MuiTableCell'] = {
  styleOverrides: {
    root: ({theme}) => ({
      padding: `${theme.spacing(1.75)} ${theme.spacing(2.25)}`, //14px 18px
      border: `1px solid var(--borders-neutral-primary)`,
      color: 'var(--text-neutral-primary)',
    }),
    head: () => ({
      fontSize: '0.875rem',
      fontWeight: 500,
      backgroundColor: 'var(--background-brand-teal-primary)',
      color: 'var(--text-neutral-white-fixed);',
      borderColor: 'var(--borders-brand-teal-strong)',
      textTransform: 'uppercase',
    }),
    body: () => ({
      fontSize: '1.125rem',
      color: 'var(--text-neutral-primary)',
      border: `1px solid var(--borders-neutral-primary)`,
    }),
  },
};

export const TABLE_ROW_OVERRIDES: Components<Theme>['MuiTableRow'] = {
  styleOverrides: {
    root: () => ({
      color: 'var(--text-neutral-primary)',
      backgroundColor: 'var(--background-neutral-secondary);',
      '&:nth-of-type(odd)': {
        backgroundColor: 'var(--background-neutral-primary)',
      },
    }),
  },
};

export const TABLE_CONTAINER_OVERRIDES: Components<Theme>['MuiTableContainer'] =
  {
    styleOverrides: {
      root: () => ({
        borderRadius: '0.25rem',
      }),
    },
  };
