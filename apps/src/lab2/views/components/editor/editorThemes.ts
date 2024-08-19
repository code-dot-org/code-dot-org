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
  coral = '#e06c75',
  cyan = '#56b6c2',
  invalid = '#ffffff',
  stone = '#7d8799',
  malibu = '#61afef',
  sage = '#98c379',
  whiskey = '#d19a66',
  violet = '#c678dd',
  darkBackground = '#21252b',
  highlightBackground = '#484D57',
  selection = '#3E4451',
  cursor = '#528bff';

/**
The editor theme styles for dark mode.
*/
export const darkTheme = EditorView.theme(
  {
    '&': {
      color: color.lighter_gray,
      backgroundColor: color.darkest_slate_gray,
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
      backgroundColor: color.darkest_slate_gray,
      color: stone,
      border: 'none',
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
    // Sets the background color for the main editor area
    '&': {
      backgroundColor: color.white,
    },
    // Sets the background color for the left-hand side gutters
    '.cm-gutters': {
      backgroundColor: color.white,
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
