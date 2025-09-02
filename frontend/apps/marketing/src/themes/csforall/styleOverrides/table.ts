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
      padding: `${theme.spacing(1.75)} ${theme.spacing(2.25)}`, //14px 18px
      border: `1px solid ${theme.palette.grey['200']}`,
    }),
    head: ({theme}) => ({
      backgroundColor: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      '.MuiTypography-root.MuiTypography-body2.paragraph--color-primary': {
        fontSize: '0.875rem',
        color: theme.palette.common.white,
        textTransform: 'uppercase',
        fontWeight: 500,
      },
    }),
    body: ({theme}) => ({
      border: `1px solid ${theme.palette.grey['200']}`,
      '.MuiTypography-root.MuiTypography-body2.paragraph--color-primary': {
        fontSize: '1.125rem',
        color: theme.palette.text.primary,
      },
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
