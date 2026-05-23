/**
 * Padding-top percentage that achieves a 16:9 aspect ratio via the
 * padding-top trick (height = 0, padTop = 9/16 = 56.25%).
 */
export const ASPECT_RATIO_16_9 = '56.25%';

/** Font size for modal dialog title headings (Guide Info, ConfirmationDialog). */
export const DIALOG_TITLE_FONT_SIZE = '220%';

/**
 * Base sx for floating circular icon buttons anchored at top-right of a scene.
 * Extend with scene-specific hover colors and exact width.
 */
export const cornerIconButtonBaseSx = {
  position: 'absolute',
  top: '2%',
  right: '1.2%',
  borderRadius: '50px',
  padding: '0.75% 1.2%',
  fontSize: '120%',
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
