import {alpha, Components, Theme} from '@mui/material/styles';

import {createFontStack} from '@/themes/common/constants';
import {NOTO_FONT} from '@/themes/constants/fonts';

import {ROBOTO_MONO_FONT} from '../constants/fonts';

export const LINK_OVERRIDES: Components<Theme>['MuiLink'] = {
  styleOverrides: {
    root: ({theme}) => ({
      fontFamily: createFontStack(ROBOTO_MONO_FONT, NOTO_FONT),
      color: theme.palette.text.primary,
      fontWeight: 500,
      lineHeight: 1.45,
      marginBottom: theme.spacing(2),
      textDecoration: 'underline',
      transition: 'color 0.2s ease-in-out',
      '& svg': {
        transition: 'color 0.2s ease-in-out',
        marginTop: theme.spacing(0.4),
      },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
        borderRadius: theme.spacing(0.5),
      },
      '&.MuiLink-root.link--color-primary': {
        color: theme.palette.text.primary,
        '&:hover': {
          color: theme.palette.secondary.main,
          '& svg': {
            color: theme.palette.secondary.main,
          },
        },
        '& svg': {
          color: theme.palette.text.primary,
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
        fontSize: '1.375rem', // 22px
      },
      '&.MuiLink-root.link--size-m': {
        fontSize: '1.125rem', // 18px
      },
      '&.MuiLink-root.link--size-s': {
        fontSize: '1rem', // 16px
      },
      '&.MuiLink-root.link--size-xs': {
        fontSize: '0.875rem', // 14px
      },
    }),
  },
};
