import {
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import {
  indentOnInput,
  foldGutter,
  foldKeymap,
  defaultHighlightStyle,
  bracketMatching,
  syntaxHighlighting,
} from '@codemirror/language';
import {
  defaultKeymap,
  indentWithTab,
  history,
  historyKeymap,
} from '@codemirror/commands';
import {closeBrackets, closeBracketsKeymap} from '@codemirror/autocomplete';
import {highlightSelectionMatches, searchKeymap} from '@codemirror/search';

// Extensions for codemirror. Based on @codemirror/basic-setup, with javascript-specific
// extensions removed (lint, autocomplete). This is the base configuration for all codemirror
// editors on the site. Any changes here will impact Java Lab, Python Lab, and Web Lab 2.
const editorConfig = [
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
    indentWithTab,
  ]),
  EditorState.tabSize.of(2),
];

export {editorConfig};
