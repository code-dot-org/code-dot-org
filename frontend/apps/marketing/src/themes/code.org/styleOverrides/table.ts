import {Components, Theme} from '@mui/material/styles';

// Empty template for table component overrides in MUI theme.
export const TABLE_OVERRIDES: Components<Theme>['MuiTable'] = {
  styleOverrides: {
    root: () => ({
      tableLayout: 'fixed',
    }),
  },
};

export const TABLE_CELL_OVERRIDES: Components<Theme>['MuiTableCell'] = {
  styleOverrides: {
    root: ({theme}) => ({
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`, //14px 18px
      border: `1px solid var(--borders-neutral-primary)`,
      color: 'var(--text-neutral-primary)',
      verticalAlign: 'top',
    }),
    head: () => ({
      backgroundColor: 'var(--background-brand-teal-primary)',
      borderColor: 'var(--borders-brand-teal-strong)',
      textTransform: 'uppercase',

      '.MuiTypography-root.MuiTypography-body2.paragraph--color-primary': {
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'var(--text-neutral-white-fixed);',
        margin: 0,
        lineHeight: '1.23rem',
      },
    }),
    body: () => ({
      border: `1px solid var(--borders-neutral-primary)`,

      '.MuiTypography-root.MuiTypography-body2.paragraph--color-primary': {
        fontSize: '1rem',
        color: 'var(--text-neutral-primary)',
        margin: 0,
        lineHeight: '1.48rem',
      },
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
