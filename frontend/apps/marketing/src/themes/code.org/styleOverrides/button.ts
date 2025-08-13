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
            fontWeight: 600,
            lineHeight: '148%',
            fontStyle: 'normal',
            padding: localTheme.spacing(0.625, 1.5),
            svg: {
              fontSize: '1.125rem',
              lineHeight: '1.25',
            },
          },
        '&.MuiButton-contained.MuiButton-sizeMedium, &.MuiButton-outlined.MuiButton-sizeMedium':
          {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: '148%',
            fontStyle: 'normal',
            padding: localTheme.spacing(0.75, 2),
            borderRadius: 4,
          },
        '&.MuiButton-outlined.button--color-secondary': {
          color: 'var(--text-neutral-primary)',
          borderColor: 'var(--border-neutral-primary)',
          '&:hover': {
            backgroundColor: 'var(--background-neutral-tertiary)',
          },
        },
        '&.video-play-button': {
          height: '64px',
          width: '64px',
          border: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          borderRadius: '100px',
          background: 'var(--neutral-base-white)',
          boxShadow: `
          0 3px 4px 0 rgb(255 255 255 / 0.23) inset, 
          0 -4px 4px 0 rgb(0 0 0 / 0.07) inset,
          0 3px 6px 0 rgb(0 0 0 / 0.2)`,
          svg: {
            fontSize: '52px',
            color: 'var(--brand-purple-50)',
          },
        },
      };
    },
  },
};
