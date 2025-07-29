import {alpha, Components, Theme} from '@mui/material/styles';

export const APPBAR_OVERRIDES: Components<Theme>['MuiAppBar'] = {
  styleOverrides: {
    root: ({theme}) => ({
      backgroundColor: theme.palette.background.default,
      // backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(2, 4),
      '& a:has(img)': {
        marginBottom: 0,
        lineHeight: 0,
      },
      '& .MuiToolbar-root': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
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
