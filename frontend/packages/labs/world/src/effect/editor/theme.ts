import {createTheme} from '@mui/material/styles';

/**
 * The editor's MUI theme: dark, dense, and matching the canvas palette the
 * custom pieces (nodes, wires, knobs) already use.
 *
 * This mounts as a *nested* ThemeProvider inside `EffectEditor`. On mainline,
 * the host wraps the page in the brand theme (`CdoTheme`); nesting composes,
 * and the effect editor keeps its dark canvas-tool look either way — like the
 * other in-canvas editors do.
 *
 * Two rules are enforced through defaults here rather than at every call
 * site:
 * - Everything is `size="small"` — this UI is chrome around a canvas, not a
 *   settings page.
 * - Nothing may portal. MUI portals mount on `document.body`, *outside* the
 *   `data-notranslate` container, which would hand already-translated strings
 *   to the mainline LocalizeJS DOM engine. Selects are native; Popover/Menu
 *   defaults disable portals as a backstop for future use.
 */

/** The palette shared with the CSS-module side of the editor. */
export const EDITOR_COLORS = {
  canvas: '#1b1f30',
  surface: '#262b40',
  field: '#1b1f30',
  border: '#3a4160',
  text: '#e8ebf5',
  muted: '#9aa4c4',
  accent: '#8ab4f8',
  error: '#e5484d',
  errorText: '#ff8fa3',
} as const;

export const effectEditorTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {main: EDITOR_COLORS.accent},
    error: {main: EDITOR_COLORS.error},
    background: {
      default: EDITOR_COLORS.canvas,
      paper: EDITOR_COLORS.surface,
    },
    text: {
      primary: EDITOR_COLORS.text,
      secondary: EDITOR_COLORS.muted,
    },
    divider: EDITOR_COLORS.border,
  },
  shape: {borderRadius: 6},
  typography: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: 12.5,
    button: {textTransform: 'none'},
  },
  components: {
    MuiButton: {
      defaultProps: {size: 'small', variant: 'outlined', color: 'inherit'},
      styleOverrides: {
        root: {
          borderColor: EDITOR_COLORS.border,
          fontSize: 12,
          paddingBlock: 2,
        },
      },
    },
    MuiIconButton: {defaultProps: {size: 'small'}},
    MuiTextField: {defaultProps: {size: 'small'}},
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: 12,
          backgroundColor: EDITOR_COLORS.field,
        },
        notchedOutline: {borderColor: EDITOR_COLORS.border},
      },
    },
    MuiInputLabel: {styleOverrides: {root: {fontSize: 12}}},
    MuiSlider: {defaultProps: {size: 'small'}},
    MuiMenuItem: {styleOverrides: {root: {fontSize: 12, minHeight: 28}}},
    MuiListItemButton: {styleOverrides: {root: {paddingBlock: 2}}},
    // Category headings in the node palette. They are sticky (MUI's default),
    // which is what keeps the current section named while a long list scrolls
    // — but sticky demands an opaque background, or the items pass *through*
    // the heading and both draw at once.
    MuiListSubheader: {
      styleOverrides: {
        root: {
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          lineHeight: '20px',
          paddingBlock: 4,
          textTransform: 'uppercase',
          background: EDITOR_COLORS.surface,
          color: EDITOR_COLORS.muted,
        },
      },
    },
    // The no-portal backstop: anything popover-like stays inside the
    // data-notranslate container. See the module comment.
    MuiPopover: {defaultProps: {disablePortal: true}},
    MuiMenu: {defaultProps: {disablePortal: true}},
    MuiModal: {defaultProps: {disablePortal: true}},
    MuiDialog: {defaultProps: {disablePortal: true}},
    MuiPaper: {defaultProps: {elevation: 4}},
  },
});
