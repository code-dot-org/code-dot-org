import {
  syntaxHighlighting,
  defaultHighlightStyle,
  HighlightStyle,
} from '@codemirror/language';
import {EditorView} from '@codemirror/view';
import {tags} from '@lezer/highlight';

import color from '@cdo/apps/util/color';

// modified from @codemirror/theme-one-dark
const chalky = '#e5c07b',
  coral = '#E48189',
  cyan = '#56b6c2',
  invalid = '#ffffff',
  stone = color.light_gray_500,
  malibu = '#61afef',
  sage = '#98c379',
  whiskey = '#d19a66',
  violet = '#c678dd',
  darkBackground = color.light_black,
  highlightBackground = '#2c313a',
  selection = '#484D57',
  cursor = '#528bff',
  hotPink = '#FF69B4';

/**
 * Lab 2 only: editor + gutters use semantic tokens under ThemeProvider data-theme.
 * Do not use in legacy labs (e.g. Java Lab) that lack that context.
 */
export const lab2EditorBackgroundTheme = EditorView.theme({
  '&.cm-editor': {
    backgroundColor: 'var(--background-neutral-primary)',
  },
  '&.cm-editor .cm-gutters': {
    backgroundColor: 'var(--background-neutral-primary)',
  },
});

/**
 * Lab 2 only: recolors @codemirror/merge's diff highlighting (used by both
 * CodeEditor's split MergeView and codebridge's unifiedMergeView) with
 * semantic tokens instead of its hardcoded GitHub-ish defaults, so diff
 * colors track light/dark mode. Selectors mirror @codemirror/merge's own
 * baseTheme (see node_modules/@codemirror/merge/dist/index.js) class-for-
 * class; a plain EditorView.theme() (default precedence) reliably overrides
 * its EditorView.baseTheme() rules (Prec.lowest) for the same selectors.
 */
export const diffTheme = EditorView.theme({
  '&.cm-merge-a .cm-changedLine, .cm-deletedChunk': {
    backgroundColor: 'var(--background-error-light)',
  },
  '&.cm-merge-b .cm-changedLine, .cm-inlineChangedLine': {
    backgroundColor: 'var(--background-success-light)',
  },
  '&.cm-merge-a .cm-changedLineGutter, .cm-deletedLineGutter': {
    backgroundColor: 'var(--border-error-primary)',
  },
  '&.cm-merge-b .cm-changedLineGutter, .cm-inlineChangedLineGutter': {
    backgroundColor: 'var(--border-success-primary)',
  },
  '&.cm-merge-a .cm-changedText, .cm-deletedChunk .cm-deletedText': {
    background:
      'linear-gradient(var(--border-error-primary), var(--border-error-primary)) bottom/100% 2px no-repeat',
  },
  '&.cm-merge-b .cm-changedText': {
    background:
      'linear-gradient(var(--border-success-primary), var(--border-success-primary)) bottom/100% 2px no-repeat',
  },
  '&.cm-merge-b .cm-deletedText': {
    backgroundColor: 'var(--background-error-light)',
  },
  '.cm-collapsedLines': {
    background:
      'linear-gradient(to bottom, transparent 0, var(--background-neutral-secondary) 30%, var(--background-neutral-secondary) 70%, transparent 100%)',
  },
});

/**
The editor theme styles for dark mode.
*/
export const darkTheme = EditorView.theme(
  {
    '&': {
      color: color.lighter_gray,
      backgroundColor: darkBackground,
    },
    '.cm-content': {
      caretColor: cursor,
    },
    '&.cm-focused .cm-cursor': {borderLeftColor: cursor},

    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {backgroundColor: selection},
    '.cm-panels': {backgroundColor: darkBackground, color: color.lighter_gray},
    '.cm-panels button': {color: color.lightest_gray},
    '.cm-panels.cm-panels-top': {borderBottom: '2px solid black'},
    '.cm-panels.cm-panels-bottom': {borderTop: '2px solid black'},
    '.cm-searchMatch': {
      backgroundColor: '#72a1ff59',
      outline: '1px solid #457dff',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#6199ff2f',
    },
    '.cm-activeLine': {backgroundColor: '#6699ff0b'},
    '.cm-selectionMatch': {backgroundColor: '#aafe661a'},
    '.cm-matchingBracket, .cm-nonmatchingBracket': {
      backgroundColor: '#bad0f847',
      outline: '1px solid #515a6b',
    },
    '.cm-gutters': {
      backgroundColor: darkBackground,
      color: stone,
      border: 'none',
      paddingInline: '0.25rem',
    },
    '.cm-lintRange-error': {
      backgroundImage: 'none !important',
      textDecoration: 'underline wavy',
      textDecorationColor: hotPink,
    },
    '.cm-activeLineGutter': {
      backgroundColor: highlightBackground,
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ddd',
    },
    '.cm-tooltip': {
      border: '1px solid #181a1f',
      backgroundColor: darkBackground,
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: highlightBackground,
        color: color.lighter_gray,
      },
    },
    '.cm-textfield': {color: color.lightest_gray},
  },
  {dark: true}
);

/**
The highlighting style for code in the dark theme.
*/
export const darkHighlightStyle = HighlightStyle.define([
  {tag: tags.keyword, color: violet},
  {
    tag: [
      tags.name,
      tags.deleted,
      tags.character,
      tags.propertyName,
      tags.macroName,
      tags.definition(tags.name),
    ],
    color: coral,
  },
  {
    tag: [tags.function(tags.variableName), tags.labelName],
    color: malibu,
  },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: whiskey,
  },
  {
    tag: [tags.separator],
    color: color.lighter_gray,
  },
  {
    tag: [
      tags.typeName,
      tags.className,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.modifier,
      tags.self,
      tags.namespace,
    ],
    color: chalky,
  },
  {
    tag: [
      tags.operator,
      tags.operatorKeyword,
      tags.url,
      tags.escape,
      tags.regexp,
      tags.link,
      tags.special(tags.string),
    ],
    color: cyan,
  },
  {tag: [tags.meta, tags.comment], color: stone},
  {tag: tags.strong, fontWeight: 'bold'},
  {tag: tags.emphasis, fontStyle: 'italic'},
  {tag: tags.strikethrough, textDecoration: 'line-through'},
  {tag: tags.link, color: stone, textDecoration: 'underline'},
  {tag: tags.heading, fontWeight: 'bold', color: coral},
  {
    tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
    color: whiskey,
  },
  {tag: [tags.processingInstruction, tags.string, tags.inserted], color: sage},
  {tag: tags.invalid, color: invalid},
]);

/**
Extension to enable the dark theme (both the editor theme and
the highlight style).
*/
export const darkMode = [darkTheme, syntaxHighlighting(darkHighlightStyle)];

// The default light theme styles for codemirror
export const lightTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: color.white,
    },
    '.cm-gutters': {
      backgroundColor: color.white,
      border: 'none',
      paddingInline: '0.25rem',
    },
    // Use the same wavy underline style for errors as the dark theme
    '.cm-lintRange-error': {
      backgroundImage: 'none !important',
      textDecoration: 'underline wavy',
      textDecorationColor: color.red,
    },
  },
  {dark: false}
);

// Extension to enable the light theme (both the editor theme and the highlight style).
export const lightMode = [
  lightTheme,
  syntaxHighlighting(defaultHighlightStyle),
];

export const DEFAULT_FONT_SIZE_PX = 13;
export const MIN_FONT_SIZE_PX = 13;
export const MAX_FONT_SIZE_PX = 68;
export const FONT_SIZE_INCREMENT_PX = 5;
