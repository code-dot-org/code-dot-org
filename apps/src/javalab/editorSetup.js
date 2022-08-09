import {
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap
} from '@codemirror/view';
import {EditorState, Prec} from '@codemirror/state';
import {history, historyKeymap} from '@codemirror/history';
import {foldGutter, foldKeymap} from '@codemirror/fold';
import {indentOnInput} from '@codemirror/language';
import {lineNumbers} from '@codemirror/gutter';
import {defaultKeymap, indentWithTab} from '@codemirror/commands';
import {bracketMatching} from '@codemirror/matchbrackets';
import {closeBrackets, closeBracketsKeymap} from '@codemirror/closebrackets';
import {highlightSelectionMatches, searchKeymap} from '@codemirror/search';
import {commentKeymap} from '@codemirror/comment';
import {rectangularSelection} from '@codemirror/rectangular-selection';
import {java} from '@codemirror/lang-java';
import {defaultHighlightStyle} from '@codemirror/highlight';

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
    indentWithTab
  ]),
  java(),
  EditorState.tabSize.of(2)
];

export {editorSetup};
