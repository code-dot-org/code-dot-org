import {
  closeBrackets,
  closeBracketsKeymap,
  startCompletion,
  closeCompletion,
  acceptCompletion,
  moveCompletionSelection,
} from '@codemirror/autocomplete';
import {
  defaultKeymap,
  indentWithTab,
  history,
  historyKeymap,
} from '@codemirror/commands';
import {
  indentOnInput,
  foldGutter,
  foldKeymap,
  defaultHighlightStyle,
  bracketMatching,
  syntaxHighlighting,
} from '@codemirror/language';
import {highlightSelectionMatches, searchKeymap} from '@codemirror/search';
import {EditorState} from '@codemirror/state';
import {
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';

// These are the almost same as the default keybindings for autocomplete,
// except that we changed acceptCompletion to use Tab instead of Enter.
const autocompleteKeybindings = [
  {key: 'Ctrl-Space', run: startCompletion},
  {mac: 'Alt-`', run: startCompletion},
  {key: 'Escape', run: closeCompletion},
  {key: 'ArrowDown', run: moveCompletionSelection(true)},
  {key: 'ArrowUp', run: moveCompletionSelection(false)},
  {key: 'PageDown', run: moveCompletionSelection(true, 'page')},
  {key: 'PageUp', run: moveCompletionSelection(false, 'page')},
  {key: 'Tab', run: acceptCompletion},
];

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
    // Order matters here. autocomplete is first because when autocomplete is open,
    // we want those keybindings to take precedence (for example, tab to complete, arrow keys
    // to choose from the dropdown).
    ...autocompleteKeybindings,
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
