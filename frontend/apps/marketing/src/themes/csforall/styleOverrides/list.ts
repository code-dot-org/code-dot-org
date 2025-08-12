import {Components, Theme} from '@mui/material/styles';

import {createFontStack} from '@/themes/common/constants';
import {NOTO_FONT} from '@/themes/constants/fonts';
import {ROBOTO_MONO_FONT} from '@/themes/csforall/constants/fonts';

export const LIST_OVERRIDES: Components<Theme>['MuiList'] = {
  styleOverrides: {
    root: ({theme}) => ({
      padding: 0,
      paddingInlineStart: theme.spacing(2.5), // 20px
      gap: '0.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      margin: theme.spacing(2, 0, 0),
      '&:first-child, &:empty': {
        margin: 0,
      },
    }),
  },
};

export const LIST_ITEM_OVERRIDES: Components<Theme>['MuiListItem'] = {
  styleOverrides: {
    root: ({theme}) => ({
      display: 'list-item',
      padding: 0,
      gap: theme.spacing(1),
      color: theme.palette.text.primary,
      fontFamily: createFontStack(ROBOTO_MONO_FONT, NOTO_FONT),
      fontWeight: 400,
      fontStyle: 'normal',

      '&::marker': {
        color: theme.palette.text.primary,
        fontFamily: NOTO_FONT,
      },
    }),
  },
};
