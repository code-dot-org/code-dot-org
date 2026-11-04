import {accordionSummaryClasses} from '@mui/material/AccordionSummary';
import type {Components, Theme} from '@mui/material/styles';

/**
 * Styles for MUI's Accordion, AccordionSummary and AccordionDetails. Values
 * reproduce the DSCO accordion (src/accordion/accordion.module.scss). The
 * override is global; the legacy behavior (no heading, no region role, no
 * animation) lives in the MuiAccordion wrapper, not here.
 */

const {expanded, focusVisible, expandIconWrapper} = accordionSummaryClasses;

export const ACCORDION_OVERRIDES: Components<Theme>['MuiAccordion'] = {
  // `square` also keeps off MUI's first-of-type/last-of-type corner radii.
  defaultProps: {
    disableGutters: true,
    square: true,
    elevation: 0,
  },
  styleOverrides: {
    root: {
      border: '1px solid var(--borders-neutral-primary)',
      borderRadius: '0.25rem',
      background: 'var(--background-neutral-secondary)',
      color: 'var(--text-neutral-primary)',
      overflow: 'hidden',
      '&::before': {display: 'none'},
      // The ring sits on the item, as DSCO's details:has(summary:focus-visible).
      [`&:has(.${accordionSummaryClasses.root}.${focusVisible})`]: {
        outline: 'var(--borders-brand-teal-primary) solid 2px',
        outlineOffset: '0.125rem',
      },
    },
  },
};

export const ACCORDION_SUMMARY_OVERRIDES: Components<Theme>['MuiAccordionSummary'] =
  {
    styleOverrides: {
      root: {
        // A <button> does not inherit font: the UA and dashboard's legacy.scss set their own.
        font: 'inherit',
        minHeight: 0,
        padding: '0.75rem 1.25rem',
        gap: '0.875rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--background-neutral-primary)',
        transition: 'none',
        '& p': {margin: 0},
        [`&.${expanded}`]: {
          borderBottom: '1px solid var(--borders-neutral-primary)',
        },
        [`&.${focusVisible}`]: {
          background: 'var(--background-neutral-primary)',
        },
        '&:hover': {
          background: 'var(--background-neutral-secondary)',
          [`& .${expandIconWrapper}`]: {
            color: 'var(--text-neutral-quaternary)',
          },
        },
      },
      content: {margin: 0},
      expandIconWrapper: {
        color: 'var(--text-neutral-placeholder)',
        transform: 'none',
        transition: 'all 0.2s ease',
        [`&.${expanded}`]: {transform: 'scaleY(-1)'},
      },
    },
  };

export const ACCORDION_DETAILS_OVERRIDES: Components<Theme>['MuiAccordionDetails'] =
  {
    styleOverrides: {
      root: {
        padding: 0,
        '& > p': {
          margin: 0,
          padding: '1.25rem',
        },
      },
    },
  };
