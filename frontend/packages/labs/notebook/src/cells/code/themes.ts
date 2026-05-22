/**
 * CodeMirror theme bridge for the notebook lab.
 *
 * Two editor themes mirror the Material Dark / Basic Light palettes from the
 * reference jupyter-k12 implementation.  Hex values are permitted inside
 * EditorView.theme() because they are CM Extension constants — not MUI sx
 * props — and are therefore exempt from the no-hex-in-MUI-sx rule.
 *
 * Consumers should call `useEditorTheme()` rather than importing a theme
 * directly, so the active lab theme is always applied automatically.
 */

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';
import { useLabTheme } from '../../theme';

// ---------------------------------------------------------------------------
// Light theme — based on Nord "Snow Storm" palette
// ---------------------------------------------------------------------------

/** Editor background and text for light mode. */
const lightBg = '#ffffff';
const lightFg = '#2e3440';
/** Subtle highlight for the active line and gutter entry. */
const lightHighlight = '#eceff4';
/** Selection background. */
const lightSelection = '#d8dee9';
/** Cursor colour. */
const lightCursor = '#3b4252';
/** Gutter background — matches editor background. */
const lightGutter = '#f8f9fa';

/** CodeMirror light theme for notebook code cells. */
export const notebookLightTheme: Extension = EditorView.theme(
  {
    '&': {
      backgroundColor: lightBg,
      color: lightFg,
    },
    '.cm-content': {
      caretColor: lightCursor,
      fontFamily: 'JetBrainsMono, "Fira Mono", monospace',
    },
    '.cm-focused .cm-cursor': {
      borderLeftColor: lightCursor,
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: lightSelection },
    '.cm-activeLine': { backgroundColor: lightHighlight },
    '.cm-activeLineGutter': { backgroundColor: lightHighlight },
    '.cm-gutters': {
      backgroundColor: lightGutter,
      color: lightCursor,
      border: 'none',
    },
  },
  { dark: false }
);

/** Syntax-highlighting style paired with the light theme. */
const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#5e81ac' },
  { tag: [t.string, t.special(t.string)], color: '#d08770' },
  { tag: t.comment, color: '#7a8a99', fontStyle: 'italic' },
  { tag: t.number, color: '#b48ead' },
  { tag: [t.function(t.variableName), t.definition(t.variableName)], color: '#5e81ac' },
  { tag: t.typeName, color: '#ebcb8b' },
  { tag: t.operator, color: '#a3be8c' },
  { tag: t.bool, color: '#b48ead' },
  { tag: t.invalid, color: '#bf616a' },
]);

/** Full light Extension: theme + highlighting. */
export const notebookLight: Extension = [
  notebookLightTheme,
  syntaxHighlighting(lightHighlightStyle),
];

// ---------------------------------------------------------------------------
// Dark theme — based on Material Dark palette
// ---------------------------------------------------------------------------

/** Editor background for dark mode — intentionally near-black. */
const darkBg = '#2e3235';
/** Default text colour in dark mode. */
const darkFg = '#bdbdbd';
/** Subtle active-line highlight — slightly lighter than the background. */
const darkHighlight = '#414b46';
/** Cursor colour in dark mode. */
const darkCursor = '#a0a4ae';
/** Gutter background matches editor background. */
const darkGutter = '#2e3235';

/** CodeMirror dark theme for notebook code cells. */
export const notebookDarkTheme: Extension = EditorView.theme(
  {
    '&': {
      backgroundColor: darkBg,
      color: darkFg,
    },
    '.cm-content': {
      caretColor: darkCursor,
      fontFamily: 'JetBrainsMono, "Fira Mono", monospace',
    },
    '.cm-focused .cm-cursor': {
      borderLeftColor: darkCursor,
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: '#505d64' },
    '.cm-activeLine': { backgroundColor: darkHighlight },
    '.cm-activeLineGutter': { backgroundColor: darkHighlight, color: '#e0e0e0' },
    '.cm-gutters': {
      backgroundColor: darkGutter,
      color: '#606f7a',
      borderRight: '1px solid #4f5b66',
    },
  },
  { dark: true }
);

/** Syntax-highlighting style paired with the dark theme. */
const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#cf6edf' },
  { tag: [t.string, t.special(t.string)], color: '#99d066' },
  { tag: t.comment, color: '#707d8b', fontStyle: 'italic' },
  { tag: t.number, color: '#ffad42' },
  { tag: [t.function(t.variableName), t.definition(t.variableName)], color: '#56c8d8' },
  { tag: t.typeName, color: '#ffad42' },
  { tag: t.operator, color: '#7186f0' },
  { tag: t.bool, color: '#56c8d8' },
  { tag: t.invalid, color: '#ff5f52' },
]);

/** Full dark Extension: theme + highlighting. */
export const notebookDark: Extension = [
  notebookDarkTheme,
  syntaxHighlighting(darkHighlightStyle),
];

// ---------------------------------------------------------------------------
// Theme selector hook
// ---------------------------------------------------------------------------

/**
 * Returns the CodeMirror Extension matching the active lab theme.
 * Components should include this in their EditorView extensions array so the
 * editor automatically uses the correct visual style.
 *
 * @returns CodeMirror Extension (light or dark variant)
 */
export function useEditorTheme(): Extension {
  const labTheme = useLabTheme();
  return labTheme === 'dark' ? notebookDark : notebookLight;
}
