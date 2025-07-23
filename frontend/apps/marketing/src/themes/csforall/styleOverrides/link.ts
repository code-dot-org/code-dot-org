import {Components, Theme} from '@mui/material/styles';

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
      '&:hover': {
        color: theme.palette.secondary.main,
        '& svg': {
          color: theme.palette.secondary.main,
        },
      },
      '& svg': {
        color: theme.palette.text.primary,
        transition: 'color 0.2s ease-in-out',
      },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
        borderRadius: theme.spacing(0.5),
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
