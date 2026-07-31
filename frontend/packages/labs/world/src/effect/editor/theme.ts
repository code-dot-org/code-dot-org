import {createTheme, type Theme} from '@mui/material/styles';

/**
 * The editor's MUI theme, layered onto the host's.
 *
 * It is a *function* of the outer theme, not an object, and that distinction is
 * the whole design: `<ThemeProvider theme={object}>` replaces the parent theme
 * for its subtree, while a function composes with it. Composing is what keeps
 * the editor inside the design system — `CdoTheme` sets `cssVariables: true`
 * and writes its component overrides in the semantic colors
 * (`var(--text-neutral-primary)` and friends), so MUI chrome in here follows
 * the lab's Light/Dark setting for free. Replacing it would have pinned the
 * chrome to whatever palette this file happened to hard-code.
 *
 * So there is no palette below. What is left is the handful of things that are
 * true of this surface and not of a page:
 *
 * - **Density.** Everything defaults to `size="small"`: this is chrome around a
 *   canvas, not a settings page.
 * - **No portals.** MUI portals mount on `document.body`, *outside* the
 *   `data-notranslate` container, which would hand already-translated strings
 *   to the LocalizeJS DOM engine. Selects are native; the Popover/Menu/Modal/
 *   Dialog defaults here are the backstop for anything added later.
 *
 * Colors that the canvas and the chrome must agree on come from the
 * `--effect-editor-*` variables, defined once in `EffectEditor.module.css` from
 * the same semantic tokens. Using them here rather than literals is also what
 * lets a style override follow the theme: a `var()` is resolved by the browser
 * at paint, so it re-resolves when `data-theme` changes above us.
 */
export const effectEditorTheme = (outer: Theme): Theme =>
  createTheme(outer, {
    shape: {borderRadius: 6},
    typography: {
      // Sizes only. The family comes from the outer theme, which is the design
      // system's stack.
      fontSize: 12.5,
      button: {textTransform: 'none'},
    },
    components: {
      MuiButton: {
        defaultProps: {size: 'small', variant: 'outlined', color: 'inherit'},
        styleOverrides: {
          root: {
            borderColor: 'var(--effect-editor-border)',
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
            backgroundColor: 'var(--effect-editor-field)',
          },
          notchedOutline: {borderColor: 'var(--effect-editor-border)'},
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
            background: 'var(--effect-editor-surface)',
            color: 'var(--effect-editor-muted)',
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
