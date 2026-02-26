import {
  closeBrackets,
  closeBracketsKeymap,
  acceptCompletion,
} from '@codemirror/autocomplete';
import {
  defaultKeymap,
  indentWithTab,
  history,
  historyKeymap,
} from '@codemirror/commands';
import {
  indentOnInput,
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

// We use default keybindings for autocomplete, but we add 'Tab' to also accept completion.
// 'Enter' accepts completion by default: https://github.com/codemirror/autocomplete/blob/ab0a89942b237bbc13735604b018d10c0101b5ea/src/index.ts#L39-L48
const autocompleteKeybindings = [{key: 'Tab', run: acceptCompletion}];

// Extensions for codemirror. Based on @codemirror/basic-setup, with javascript-specific
// extensions removed (lint, autocomplete). This is the base configuration for all codemirror
// editors on the site. Any changes here will impact Java Lab, Python Lab, and Web Lab 2.
const editorConfig = [
  lineNumbers(),
  highlightSpecialChars(),
  history(),
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
