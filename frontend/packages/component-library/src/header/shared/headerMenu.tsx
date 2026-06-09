import type {CSSObject, SxProps} from '@mui/material/styles';

/**
 * Shared header-trigger styling: white glyph/text on the teal bar plus the
 * brand-inverse focus ring. Spread into each trigger's `sx`; each adds its own
 * specifics (pill border, hover background, breakpoint gate).
 */
export const headerTriggerBase: CSSObject = {
  color: 'var(--neutral-base-white)',
  '&:focus-visible': {
    outline: '2px solid var(--text-neutral-inverse)',
    outlineOffset: '2px',
  },
};

/**
 * Shared header dropdown-menu styling (Help, Account). Applied to the MUI Menu's
 * paper/list slots and to each MenuItem, each qualified by its MUI class
 * (compound, on-element) so it beats MUI's defaults on specificity regardless of
 * stylesheet order or portal nesting. Reproduces the legacy header dropdown panel.
 */

/** Menu `paper` slot: the dropdown panel surface. Pass via `slotProps={{paper:{sx: headerMenuPaperSx}}}`. */
export const headerMenuPaperSx: SxProps = {
  '&.MuiPaper-root': {
    marginTop: '4px',
    backgroundColor: 'var(--background-neutral-primary)',
    border: '1px solid var(--borders-neutral-primary)',
    borderRadius: '4px',
    boxShadow:
      'rgb(0 0 0 / 0.1) 0 10px 15px -3px, rgb(0 0 0 / 0.05) 0 4px 6px -2px',
  },
};

/** Menu `list` slot. 6px inset + 228px content + 1px border = 242px, matching prod. */
export const headerMenuListSx: SxProps = {
  '&.MuiList-root': {
    minWidth: '240px',
    padding: '6px',
  },
};

/**
 * Shared menu row. Applied via `sx` on the polymorphic `MenuItem` (rendered as
 * an anchor), so the component's `component`/`href` typing is preserved. Pin
 * line-height to 20px (prod); the inherited 1.48 ratio overshoots.
 */
export const headerMenuItemSx: SxProps = {
  '&.MuiMenuItem-root': {
    display: 'block',
    minHeight: 0,
    padding: '10px',
    color: 'var(--text-neutral-primary)',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    '&:visited, &:active': {
      color: 'var(--text-neutral-primary)',
    },
    // Legacy header hover gray (rgb(231,232,234)); no design token matches.
    '&:hover': {
      backgroundColor: '#e7e8ea',
    },
  },
};
