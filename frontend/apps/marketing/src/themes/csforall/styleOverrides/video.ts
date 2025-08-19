import {Components, Theme} from '@mui/material/styles';

export const VIDEO_OVERRIDES: Components<Theme>['MuiVideo'] = {
  styleOverrides: {
    root: () => ({}),
    wrapper: () => ({}),
    facade: ({theme}) => ({
      '.video-play-button': {
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
    }),
    posterImage: () => ({}),
    errorPlaceholder: ({theme}) => ({
      backgroundColor: theme.palette.common.black,
      padding: 0,
      '.MuiTypography-root, svg': {
        color: theme.palette.common.white,
      },
    }),
    footer: () => ({
      'a.video-download-button.MuiButton-root': {
        lineHeight: 1.57,
        alignItems: 'center',
        paddingBlock: '1px',
        margin: 0,
      },
    }),
  },
};
