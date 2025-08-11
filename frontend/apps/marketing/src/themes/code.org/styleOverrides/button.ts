import {Components, Theme, createTheme} from '@mui/material/styles';

// Setting these colors here to only apply to buttons
// since we aren't using MUI colors elsewhere.
const customTheme = (theme: Theme) =>
  createTheme({
    palette: {
      ...theme.palette,
      primary: {
        main: '#8c52ba',
      },
    },
  });

export const BUTTON_OVERRIDES: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: ({theme}) => {
      const localTheme = customTheme(theme);
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: localTheme.spacing(0.75),
        textTransform: 'none',
        borderRadius: 4,
        'html[dir="rtl"] & svg': {
          transform: 'scaleX(-1)',
        },
        '& .MuiButton-icon': {
          marginRight: 0,
          marginLeft: 0,
        },
        '&:focus-visible': {
          outline: '2px solid ' + localTheme.palette.secondary.main,
          outlineOffset: '2px',
        },
        '&.MuiButton-contained': {
          border: '1px solid transparent',
        },
        '&.MuiButton-containedPrimary': {
          backgroundColor: localTheme.palette.primary.main,
          color: localTheme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: localTheme.palette.primary.dark,
          },
        },
        '&.MuiButton-contained.MuiButton-sizeSmall, &.MuiButton-outlined.MuiButton-sizeSmall':
          {
            fontSize: '0.875rem',
            padding: localTheme.spacing(0.75, 1.5),
          },
        '&.MuiButton-contained.MuiButton-sizeMedium, &.MuiButton-outlined.MuiButton-sizeMedium':
          {
            fontSize: '1rem',
            padding: localTheme.spacing(0.75, 2),
            borderRadius: 4,
          },
      };
    },
  },
};
