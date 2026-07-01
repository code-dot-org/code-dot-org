/**
 * Padding-top percentage that achieves a 16:9 aspect ratio via the
 * padding-top trick (height = 0, padTop = 9/16 = 56.25%).
 */
export const ASPECT_RATIO_16_9 = '56.25%';

/** Font size for modal dialog title headings (Guide Info, ConfirmationDialog). */
export const DIALOG_TITLE_FONT_SIZE = '220%';

/** Absolute-fill overlay: covers parent's entire bounding box. */
export const absoluteFillSx = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
} as const;

/**
 * Visually-hidden pattern (sr-only).  Removes element from visual flow while
 * keeping it accessible to screen readers.  Do NOT use on containers that
 * must maintain layout height — use color:transparent + padding instead.
 */
export const srOnlySx = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

/**
 * Base sx for floating circular icon buttons anchored at top-right of a scene.
 * Extend with scene-specific hover colors and exact width.
 *
 * Content-box sizing: height 6% is the content height; padding (0.75% top/bottom)
 * adds to the total.  Width is set per-scene (erase 2.4%, info 2.5%).
 */
export const cornerIconButtonBaseSx = {
  position: 'absolute',
  top: '2%',
  right: '1.2%',
  borderRadius: '50px',
  padding: '0.75% 1.2%',
  fontSize: '120%',
  // `height: 6%` is what production sets inline on the equivalent <div>.
  // Paired with `height: 100%` + `display: block` on the inner FA SVG,
  // the SVG stretches to fill the 6%-defined parent content height.  Without
  // it, MUI IconButton's flex layout collapses to the SVG's intrinsic 1em
  // and the button renders 4 px shorter than production.
  height: '6%',
  backgroundColor: 'var(--ocean-color-white)',
  color: 'var(--ocean-color-grey)',
} as const;

/**
 * Sx for the primary orange action button anchored at bottom-right of a scene.
 * Used by Continue, Finish, and Run buttons across all scenes.
 */
export const orangeCornerButtonSx = {
  position: 'absolute',
  bottom: '2%',
  right: '1.2%',
  backgroundColor: 'var(--ocean-color-orange)',
  color: 'var(--ocean-color-white)',
  '&:hover': {backgroundColor: 'var(--ocean-color-orange)'},
} as const;
