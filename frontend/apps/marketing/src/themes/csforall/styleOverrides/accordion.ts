import {Components, Theme} from '@mui/material/styles';

import {FIGTREE_FONT} from '@/themes/code.org/constants/fonts';

export const ACCORDION_OVERRIDES: Components<Theme>['MuiAccordion'] = {
  styleOverrides: {
    root: ({theme}) => ({
      border: 'none',
      boxShadow: 'none',
      borderBottom: `1px solid ${theme.palette.text.primary}`,
      padding: 0,
      borderRadius: 0,
      margin: 0,
      '&:first-of-type': {
        borderRadius: 0,
      },
      '&:last-of-type': {
        borderRadius: 0,
      },
      '&.Mui-expanded': {
        margin: 0,
        minHeight: 'unset',
      },
      '&:has(.Mui-focusVisible)': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
        borderRadius: '6px',
        zIndex: 1,
      },
    }),
  },
};

export const ACCORDION_SUMMARY_OVERRIDES: Components<Theme>['MuiAccordionSummary'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        padding: theme.spacing(4, 3, 4, 0),
        margin: 0,
        minHeight: 'unset',
        borderRadius: 0,
        color: theme.palette.text.primary,

        '&.Mui-expanded': {
          minHeight: 'unset',
        },

        '&:hover': {
          color: theme.palette.secondary.main,

          '.MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
            color: theme.palette.secondary.main,
          },
        },
        '&.Mui-focusVisible': {
          backgroundColor: 'inherit',
        },
        '.MuiAccordionSummary-content': {
          fontFamily: FIGTREE_FONT,
          fontStyle: 'normal',
          fontWeight: 800,
          fontSize: '2rem', // 32px
          lineHeight: '2.25rem', // 36px
          margin: 0,
          minHeight: 'unset',

          '&.Mui-expanded': {
            margin: 0,
            minHeight: 'unset',
          },
        },
        '.MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
          color: theme.palette.text.primary,
          fontSize: '2rem',
        },
      }),
    },
  };

export const ACCORDION_DETAILS_OVERRIDES: Components<Theme>['MuiAccordionDetails'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        padding: 0,
        paddingBlockEnd: theme.spacing(4),
      }),
    },
  };
