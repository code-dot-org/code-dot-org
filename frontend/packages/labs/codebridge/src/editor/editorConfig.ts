import {
  acceptCompletion,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {bracketMatching, foldKeymap, indentOnInput} from '@codemirror/language';
import {highlightSelectionMatches, searchKeymap} from '@codemirror/search';
import {EditorState} from '@codemirror/state';
import type {Extension} from '@codemirror/state';
import {
  drawSelection,
  highlightActiveLine,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';

// We use default keybindings for autocomplete, but add 'Tab' to also accept a
// completion ('Enter' accepts by default).
const autocompleteKeybindings = [{key: 'Tab', run: acceptCompletion}];

/**
 * The base CodeMirror extension set shared by all Codebridge editors. Ported
 * from apps/src/codemirror/editorConfig.ts — based on @codemirror/basic-setup
 * with the JavaScript-specific lint/autocomplete removed.
 *
 * Syntax highlighting is deliberately NOT here: it ships with the theme (see
 * ./editorThemes) so light and dark supply their own, rather than stacking two
 * highlight styles.
 */
export const editorConfig: Extension[] = [
  lineNumbers(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    // Order matters: autocomplete first so its bindings win while it is open.
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
