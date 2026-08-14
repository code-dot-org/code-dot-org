import type {Components, Theme} from '@mui/material/styles';
import {tooltipClasses} from '@mui/material/Tooltip';

/**
 * Styles for MUI's tooltip; call sites import `Tooltip` from `@mui/material`
 * directly. Values match the CADS spec (moshebaricdo/cads tooltip.module.scss),
 * and the tooltip is one fixed size. The override is global, so every MUI
 * tooltip gets the design system look.
 */

const BACKGROUND = 'var(--background-neutral-primary-inverse)';
const FOREGROUND = 'var(--text-neutral-primary-inverse)';
/**
 * CADS trigger-to-bubble distance. Figma caret is 6×4; MUI sizes the arrow
 * square in em and the visible tip is ~0.71em, so 6px → 4px of caret. CADS
 * does `hasCaret ? 4 + caretHeight : 6` — 8px with a tail (4px air + 4px
 * caret), 6px without. MUI's placement margins are 14px and drop to 0 when
 * `arrow` is on, so the caret never counted there.
 */
const CARET_SIZE = '0.375rem';
const TRIGGER_GAP = '0.375rem';
const TRIGGER_GAP_WITH_CARET = '0.5rem';
/**
 * Caret inset on `-start`/`-end` placements. Matches bubble padding so the
 * tail sits over the content, not the rounded corner.
 */
const CARET_EDGE = '0.75rem';

/** Placement margins for one gap value. Same selectors MUI uses for 14px. */
const gapByPlacement = (gap: string) => ({
  [`.${tooltipClasses.popper}[data-popper-placement*="bottom"] &`]: {
    marginTop: gap,
  },
  [`.${tooltipClasses.popper}[data-popper-placement*="top"] &`]: {
    marginBottom: gap,
  },
  [`.${tooltipClasses.popper}[data-popper-placement*="left"] &`]: {
    marginRight: gap,
  },
  [`.${tooltipClasses.popper}[data-popper-placement*="right"] &`]: {
    marginLeft: gap,
  },
});

/**
 * Selector for the caret on each of the given popper placements. Placements
 * are physical here: MUI swaps `-start`/`-end` before Popper sees them in
 * RTL, so keying on `data-popper-placement` keeps the caret on the logical
 * start edge for free.
 */
const caretOn = (...placements: string[]) =>
  placements
    .map(p => `&[data-popper-placement="${p}"] .${tooltipClasses.arrow}`)
    .join(', ');

export const TOOLTIP_OVERRIDES: Components<Theme>['MuiTooltip'] = {
  // Tail on, text describes the trigger (so the trigger needs its own name),
  // and the bubble lines up with the trigger's start edge — CADS, not MUI's
  // centered `bottom`.
  defaultProps: {
    arrow: true,
    describeChild: true,
    placement: 'bottom-start',
  },
  styleOverrides: {
    // Popper aims the caret at the trigger center with inline styles, and the
    // offset lives in a transform (`left: 0; transform: translate3d(x, 0, 0)`),
    // not in `left` itself. CADS instead pins the caret near the aligned edge
    // on `-start`/`-end` placements. Author `!important` outranks a normal
    // inline style, so these rules drop the translate and pin the caret;
    // centered placements keep MUI's trigger-centered caret.
    popper: {
      [caretOn('top-start', 'bottom-start')]: {
        transform: 'none !important',
        left: `${CARET_EDGE} !important`,
        right: 'auto !important',
      },
      [caretOn('top-end', 'bottom-end')]: {
        transform: 'none !important',
        left: 'auto !important',
        right: `${CARET_EDGE} !important`,
      },
      [caretOn('left-start', 'right-start')]: {
        transform: 'none !important',
        top: `${CARET_EDGE} !important`,
        bottom: 'auto !important',
      },
      [caretOn('left-end', 'right-end')]: {
        transform: 'none !important',
        top: 'auto !important',
        bottom: `${CARET_EDGE} !important`,
      },
    },
    tooltip: ({theme}) => ({
      ...theme.typography.body3,
      backgroundColor: BACKGROUND,
      color: FOREGROUND,
      borderRadius: 'var(--shape-sm)',
      boxShadow: 'var(--shadow-md)',
      boxSizing: 'border-box',
      maxWidth: '16rem',
      width: 'max-content',
      padding: '0.25rem 0.75rem',
      textAlign: 'left',
      // Leading icon in `title`: flex-start the icon against the text, but
      // size the icon box to one body3 line and center the glyph in it.
      // That's CADS `.label` / `.labelIcon` (height: leading, line-height: 0)
      // — flex-start alone pins the glyph to the cap-height.
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      '& i': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: '0.875rem',
        height: `calc(${theme.typography.body3.fontSize} * ${theme.typography.body3.lineHeight})`,
        fontSize: '0.875rem',
        lineHeight: 0,
        color: FOREGROUND,
      },
      // Arrow font-size sets its box, since MUI measures the arrow in em.
      [`& .${tooltipClasses.arrow}`]: {fontSize: CARET_SIZE},
      ...gapByPlacement(TRIGGER_GAP),
      [`&.${tooltipClasses.tooltipArrow}`]: gapByPlacement(
        TRIGGER_GAP_WITH_CARET,
      ),
    }),
    arrow: {color: BACKGROUND},
  },
};
