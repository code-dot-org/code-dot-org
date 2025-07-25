import {alpha, Components, Theme} from '@mui/material/styles';

import {createFontStack} from '@/themes/common/constants';
import {NOTO_FONT} from '@/themes/constants/fonts';

import {FIGTREE_FONT} from '../constants/fonts';

export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({theme}) => ({
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontWeight: 500,
      lineHeight: 1.4,
      marginBottom: theme.spacing(2),
      textDecoration: 'underline',
      transition: 'color 0.2s ease-in-out',
      '& svg': {
        transition: 'color 0.2s ease-in-out',
      },
      '&:focus-visible': {
        outline: '2px solid var(--text-brand-teal-primary)',
        outlineOffset: '2px',
        borderRadius: theme.spacing(0.5),
      },
      '&.MuiLink-root.link--color-primary': {
        color: 'var(--text-brand-purple-primary)',
        '&:hover': {
          color: 'var(--text-brand-purple-secondary)',
          '& svg': {
            color: 'var(--text-brand-purple-secondary)',
          },
        },
        '& svg': {
          color: 'var(--text-brand-purple-primary)',
        },
      },
      '&.MuiLink-root.link--color-white': {
        color: theme.palette.common.white,
        '&:hover': {
          color: alpha(theme.palette.common.white, 0.8),
          '& svg': {
            color: alpha(theme.palette.common.white, 0.8),
          },
        },
        '&:focus-visible': {
          outlineColor: alpha(theme.palette.common.white, 0.8),
        },
        '& svg': {
          color: theme.palette.common.white,
        },
      },
      '&.MuiLink-root.link--size-l': {
        fontSize: '1.25rem', // 20px
      },
      '&.MuiLink-root.link--size-m': {
        fontSize: '1rem', // 16px
      },
      '&.MuiLink-root.link--size-s': {
        fontSize: '0.875rem', // 14px
      },
      '&.MuiLink-root.link--size-xs': {
        fontSize: '0.75rem', // 12px
      },
    }),
  },
};
