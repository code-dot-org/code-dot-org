import {defaultHighlightStyle, syntaxHighlighting} from '@codemirror/language';
import type {Extension} from '@codemirror/state';
import {oneDark} from '@codemirror/theme-one-dark';

// Each theme carries both editor chrome and syntax highlighting, so exactly one
// highlight style is active at a time. Light uses CodeMirror's default highlight
// style; dark uses the standard One Dark theme (chrome + highlighting).
//
// TODO: replace with the code.org design-system editor themes once ported (the
// legacy apps/src/lab2/views/components/editor/editorThemes.ts keys off our
// palette). One Dark is a reasonable stand-in for now.

export const lightTheme: Extension = syntaxHighlighting(defaultHighlightStyle, {
  fallback: true,
});

export const darkTheme: Extension = oneDark;
