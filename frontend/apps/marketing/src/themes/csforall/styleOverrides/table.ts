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
      border: `1px solid ${theme.palette.grey['200']}`,
    }),
    head: ({theme}) => ({
      fontSize: '0.875rem',
      fontWeight: 500,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      borderColor: theme.palette.primary.main,
      textTransform: 'uppercase',
    }),
    body: ({theme}) => ({
      fontSize: '1.125rem',
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.grey['200']}`,
    }),
  },
};

export const TABLE_ROW_OVERRIDES: Components<Theme>['MuiTableRow'] = {
  styleOverrides: {
    root: ({theme}) => ({
      backgroundColor: theme.palette.background.default,
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.background.paper,
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
