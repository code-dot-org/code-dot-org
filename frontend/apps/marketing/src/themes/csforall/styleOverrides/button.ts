import {alpha, Components, Theme} from '@mui/material/styles';

const ROBOTO_MONO_FONT = 'Roboto Mono';

export const BUTTON_OVERRIDES: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: ({theme}) => ({
      fontFamily: ROBOTO_MONO_FONT,
      display: 'inline-flex',
      alignItems: 'center',
      gap: theme.spacing(0.75),
      'html[dir="rtl"] & svg': {
        transform: 'scaleX(-1)',
      },
      '& .MuiButton-icon': {
        marginRight: 0,
        marginLeft: 0,
      },
      '&:focus-visible': {
        outline: '2px solid ' + theme.palette.primary.main,
        outlineOffset: '2px',
      },
      textTransform: 'none',
      '&.MuiButton-contained': {
        border: '1px solid transparent',
      },
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
      '&.MuiButton-contained.button--color-white': {
        backgroundColor: theme.palette.common.white,
        color: theme.palette.common.black,
        '&:hover': {
          backgroundColor: alpha(theme.palette.common.white, 0.9),
        },
        '&:focus-visible': {
          outlineColor: alpha(theme.palette.common.white, 0.8),
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
        background: theme.palette.secondary.main,
        boxShadow: '0 3px 6px 0 rgba(0, 0, 0, 0.20)',
        svg: {
          fontSize: '52px',
          color: theme.palette.common.white,
        },
        '&:hover': {
          backgroundColor: theme.palette.secondary.dark,
        },
      },
      '&.video-download-button.MuiButtonBase-root': {
        lineHeight: 1.57,
        alignItems: 'center',
        paddingBlock: '1px',
        margin: 0,
      },
    }),
  },
};
