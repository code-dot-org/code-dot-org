import {Components, Theme} from '@mui/material/styles';

const ROBOTO_MONO_FONT = 'Roboto Mono';

export const BUTTON_OVERRIDES: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: ({theme}) => ({
      fontFamily: ROBOTO_MONO_FONT,
      '&:focus-visible': {
        outline: '2px solid ' + theme.palette.primary.main,
        outlineOffset: '2px',
      },
      textTransform: 'none',
      border: '1px solid transparent',
      '&.MuiButton-contained.button--color-emphasized': {
        backgroundColor: theme.palette.secondary.main,
        '&:hover': {
          backgroundColor: theme.palette.secondary.dark,
        },
      },
      '&.MuiButton-contained.button--color-primary': {
        backgroundColor: theme.palette.primary.main,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      },
      '&.MuiButton-outlined.button--color-secondary': {
        color: theme.palette.common.black,
        borderColor: theme.palette.common.black,
        '&:hover': {
          backgroundColor: theme.palette.grey[100],
        },
      },
      '&.MuiButton-contained.MuiButton-sizeSmall, &.MuiButton-outlined.MuiButton-sizeSmall':
        {
          fontSize: '1rem',
          padding: theme.spacing(1.25, 2.5),
          borderRadius: theme.spacing(3),
        },
      '&.MuiButton-contained.MuiButton-sizeMedium, &.MuiButton-outlined.MuiButton-sizeMedium':
        {
          fontSize: '1.125rem',
          padding: theme.spacing(1.5, 3),
          borderRadius: theme.spacing(4),
        },
      '&.MuiButton-contained.MuiButton-sizeLarge, &.MuiButton-outlined.MuiButton-sizeLarge':
        {
          fontSize: '1.25rem',
          padding: theme.spacing(2, 5),
          borderRadius: theme.spacing(8),
        },
    }),
  },
};
