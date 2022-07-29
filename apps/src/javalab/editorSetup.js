import {
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap,
  EditorView,
  lineNumbers,
  rectangularSelection
} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import {
  indentOnInput,
  foldGutter,
  foldKeymap,
  defaultHighlightStyle,
  bracketMatching,
  syntaxHighlighting
} from '@codemirror/language';
import {
  defaultKeymap,
  indentWithTab,
  history,
  historyKeymap
} from '@codemirror/commands';
import {closeBrackets, closeBracketsKeymap} from '@codemirror/autocomplete';
import {highlightSelectionMatches, searchKeymap} from '@codemirror/search';
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
  syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
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
    indentWithTab
  ]),
  java(),
  EditorState.tabSize.of(2)
];

export {editorSetup};

// The default light theme styles for codemirror
export const lightTheme = EditorView.theme({}, {dark: false});

// Extension to enable the light theme (both the editor theme and the highlight style).
export const lightMode = [lightTheme, defaultHighlightStyle];
