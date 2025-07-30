import {alpha, Components, Theme} from '@mui/material/styles';

export const APPBAR_OVERRIDES: Components<Theme>['MuiAppBar'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '& .MuiBox-root': {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(4),
      },
      '& .MuiList-root': {
        display: 'flex',
        flexDirection: 'row',
        gap: theme.spacing(2),
        '& .MuiListItem-root': {
          margin: 0,
          padding: 0,
          width: 'auto',
          '& a': {
            textDecoration: 'none',
            marginBottom: 0,
            padding: theme.spacing(1, 2),
            borderRadius: theme.shape.borderRadius,
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          },
        },
      },
    }),
  },
};
