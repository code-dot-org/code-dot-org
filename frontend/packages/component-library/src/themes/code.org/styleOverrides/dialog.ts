import type {Components, Theme} from '@mui/material/styles';

/**
 * Styles for MUI's Dialog so a bare `Dialog` under CdoTheme renders the DSCO
 * CustomDialog surface: a flat neutral panel with a hairline border on a
 * near-black backdrop, at the design system's modal tier. Layout (padding,
 * radius, shadow, the close X) belongs to the wrappers in src/dialog; this
 * file is the surface only. The override is global, so every MUI dialog under
 * the theme gets it.
 */

/**
 * $zindex-modal-backdrop in component-library-styles/variables.scss. MUI's own
 * modal tier is 1300; DSCO dialogs sit at 1040, under the design system
 * popover (1070) and tooltip (1080) tiers and the legacy Bootstrap modals
 * (1050), and callouts.feature asserts the overlay is in front of a qtip.
 * Set on the Dialog root, not theme.zIndex.modal, so Menu and Popover keep
 * their tier and still open above a dialog.
 */
const MODAL_Z_INDEX = 1040;

export const DIALOG_OVERRIDES: Components<Theme>['MuiDialog'] = {
  defaultProps: {
    // DSCO dialogs appear and unmount at once. UI tests wait on the dialog
    // right after the click that opens it, and jsdom tests query it
    // synchronously, so no fade in either direction.
    transitionDuration: 0,
    // The panel is as wide as its content, capped per component in the
    // wrapper CSS, not by MUI's breakpoint table (whose `sm` is 600px, under
    // the Dialog wrapper's 39.375rem min-width).
    maxWidth: false,
  },
  styleOverrides: {
    root: {
      zIndex: MODAL_Z_INDEX,
    },
    // Paper is rendered with elevation 24 as a prop, not a default, so the
    // shadow is zeroed here rather than through MuiPaper defaultProps.
    paper: {
      backgroundColor: 'var(--background-neutral-primary)',
      backgroundImage: 'none',
      color: 'var(--text-neutral-primary)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--borders-neutral-primary)',
      borderRadius: 0,
      boxShadow: 'none',
    },
    // Dialog.js resolves `styles.backdrop` for its Backdrop slot, but
    // DialogClasses leaves the key out, so it goes in through a spread (which
    // TypeScript does not excess-property check). Styling the slot itself,
    // rather than `.MuiBackdrop-root` from the root, keeps the rule on the
    // backdrop element and scoped to dialogs.
    ...{
      backdrop: {
        backgroundColor: 'var(--neutral-black-alpha-90)',
      },
    },
  },
};
