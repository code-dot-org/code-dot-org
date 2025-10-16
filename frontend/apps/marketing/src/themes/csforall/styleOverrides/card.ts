import {Components, Theme} from '@mui/material/styles';

export const CARD_OVERRIDES: Components<Theme>['MuiCard'] = {
  styleOverrides: {
    root: {
      border: '1px solid',
      boxShadow: 'none',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      containerName: 'cardContainer',
      containerType: 'inline-size',
    },
  },
};

export const CARD_CONTENT_OVERRIDES: Components<Theme>['MuiCardContent'] = {
  styleOverrides: {
    root: ({theme}) => ({
      paddingTop: theme.spacing(4),
      paddingInline: theme.spacing(5),
    }),
  },
};

export const CARD_ACTIONS_OVERRIDES: Components<Theme>['MuiCardActions'] = {
  styleOverrides: {
    root: ({theme}) => ({
      padding: theme.spacing(5),
      paddingTop: theme.spacing(2),
      gap: theme.spacing(2),
      marginTop: 'auto',
      '@container cardContainer (width < 700px)': {
        flexDirection: 'column',
        alignItems: 'flex-start',
        '& a': {
          width: '100%',
        },
      },
    }),
  },
};
