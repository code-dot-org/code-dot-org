import {Components, Theme} from '@mui/material/styles';

import {FIGTREE_FONT} from '@/themes/code.org/constants/fonts';
import {createFontStack} from '@/themes/common/constants';
import {NOTO_FONT} from '@/themes/constants/fonts';

export const ACCORDION_OVERRIDES: Components<Theme>['MuiAccordion'] = {
  styleOverrides: {
    root: ({theme}) => ({
      boxShadow: 'none',
      borderRadius: '4px',
      border: '1px solid var(--borders-neutral-primary)',
      padding: 0,
      margin: 0,
      marginBottom: theme.spacing(2),
      '&:hover': {
        backgroundColor: 'var(--background-neutral-secondary)',
      },
      '&:last-of-type': {
        marginBottom: 0,
      },
      '&:has(.Mui-focusVisible)': {
        outline: '2px solid var(--borders-brand-teal-primary)',
        outlineOffset: '2px',
        borderRadius: '6px',
      },
    }),
  },
};

export const ACCORDION_SUMMARY_OVERRIDES: Components<Theme>['MuiAccordionSummary'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        padding: theme.spacing(1.5, 2.5, 1.5, 2.5),
        borderRadius: 0,
        color: 'var(---text-neutral-primary)',
        backgroundColor: 'var(--background-neutral-primary)',
        minHeight: 'unset',

        '&.Mui-expanded': {
          minHeight: 'unset',
        },

        '&:hover': {
          '.MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
            color: 'var(--text-neutral-quaternary)',
          },
        },
        '&.Mui-focusVisible': {
          backgroundColor: 'var(--background-neutral-primary)',
        },
        '.MuiAccordionSummary-content': {
          fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '1rem', // 16px
          lineHeight: '148%',
          margin: 0,
          minHeight: 'unset',
          color: 'var(--text-neutral-primary)',

          '&.Mui-expanded': {
            margin: 0,
            minHeight: 'unset',
          },
        },
        '.MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
          color: 'var(--text-neutral-placeholder)',
          fontSize: '1rem',
          height: '1rem',
          transform: 'scale(1.8)',
        },
      }),
    },
  };

export const ACCORDION_DETAILS_OVERRIDES: Components<Theme>['MuiAccordionDetails'] =
  {
    styleOverrides: {
      root: ({theme}) => ({
        padding: theme.spacing(2.5), // 20px
        borderTop: '1px solid var(--borders-neutral-primary)',
        backgroundColor: 'var(--background-neutral-secondary)',
      }),
    },
  };
