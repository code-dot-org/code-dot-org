import {
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap,
  EditorView
} from '@codemirror/view';
import {EditorState, Prec} from '@codemirror/state';
import {history, historyKeymap} from '@codemirror/history';
import {foldGutter, foldKeymap} from '@codemirror/fold';
import {indentOnInput} from '@codemirror/language';
import {lineNumbers} from '@codemirror/gutter';
import {defaultKeymap, defaultTabBinding} from '@codemirror/commands';
import {bracketMatching} from '@codemirror/matchbrackets';
import {closeBrackets, closeBracketsKeymap} from '@codemirror/closebrackets';
import {highlightSelectionMatches, searchKeymap} from '@codemirror/search';
import {commentKeymap} from '@codemirror/comment';
import {rectangularSelection} from '@codemirror/rectangular-selection';
import {defaultHighlightStyle} from '@codemirror/highlight';
import {java} from '@codemirror/lang-java';

// Extensions for codemirror. Based on @codemirror/basic-setup, with javascript-specific
// extensions removed (lint, autocomplete).
const editorSetup = [
  lineNumbers(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  Prec.fallback(defaultHighlightStyle),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...commentKeymap,
    defaultTabBinding
  ]),
  java()
];

export {editorSetup};

// The default light theme styles for codemirror
export const lightTheme = EditorView.theme({}, {dark: false});

// Extension to enable the light theme (both the editor theme and the highlight style).
export const lightMode = [lightTheme, defaultHighlightStyle];
