import {Components, Theme} from '@mui/material/styles';

export const VIDEO_OVERRIDES: Components<Theme>['MuiVideo'] = {
  styleOverrides: {
    root: () => ({}),
    wrapper: () => ({}),
    facade: () => ({
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
        background: 'var(--neutral-base-white)',
        boxShadow: `
          0 3px 4px 0 rgb(255 255 255 / 0.23) inset, 
          0 -4px 4px 0 rgb(0 0 0 / 0.07) inset,
          0 3px 6px 0 rgb(0 0 0 / 0.2)`,
        svg: {
          fontSize: '52px',
          color: 'var(--brand-purple-50)',
        },
        '&:hover': {
          opacity: 0.9,
        },
      },
    }),
    posterImage: () => ({}),
    errorPlaceholder: () => ({
      backgroundColor: 'var(--background-neutral-tertiary)',
      padding: 0,
      '.MuiTypography-root, svg': {
        color: 'var(--text-neutral-primary)',
      },
    }),
    footer: () => ({
      'a.video-download-button.MuiButton-root': {
        lineHeight: 1.57,
        alignItems: 'center',
        paddingBlock: 0,
        margin: 0,
        borderColor: 'var(--borders-neutral-strong)',
      },
    }),
  },
};
