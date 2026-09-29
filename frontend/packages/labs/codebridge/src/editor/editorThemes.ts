import {
  defaultHighlightStyle,
  HighlightStyle,
  syntaxHighlighting,
} from '@codemirror/language';
import type {Extension} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import {tags} from '@lezer/highlight';

// Ported from apps/src/lab2/views/components/editor/editorThemes.ts. The colors
// legacy pulls from @cdo/apps/util/color are inlined here (the standalone package
// has no access to that module):
//   light_gray_500 #989ea5, light_black #292f36, lighter_gray #c6cacd,
//   lightest_gray #e7e8ea, white #ffffff, red #c00.

// modified from @codemirror/theme-one-dark
const chalky = '#e5c07b',
  coral = '#e48189',
  cyan = '#56b6c2',
  invalid = '#ffffff',
  stone = '#989ea5', // color.light_gray_500
  malibu = '#61afef',
  sage = '#98c379',
  whiskey = '#d19a66',
  violet = '#c678dd',
  darkBackground = '#292f36', // color.light_black
  highlightBackground = '#2c313a',
  selection = '#484d57',
  cursor = '#528bff',
  hotPink = '#ff69b4',
  lighterGray = '#c6cacd', // color.lighter_gray
  lightestGray = '#e7e8ea', // color.lightest_gray
  white = '#ffffff', // color.white
  red = '#c00'; // color.red

/** The editor chrome styles for dark mode. */
const darkThemeView = EditorView.theme(
  {
    '&': {
      color: lighterGray,
      backgroundColor: darkBackground,
    },
    '.cm-content': {
      caretColor: cursor,
    },
    '&.cm-focused .cm-cursor': {borderLeftColor: cursor},

    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {backgroundColor: selection},
    '.cm-panels': {backgroundColor: darkBackground, color: lighterGray},
    '.cm-panels button': {color: lightestGray},
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
        color: lighterGray,
      },
    },
    '.cm-textfield': {color: lightestGray},
  },
  {dark: true},
);

/** The syntax highlighting style for the dark theme. */
const darkHighlightStyle = HighlightStyle.define([
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
    color: lighterGray,
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

/** The editor chrome styles for light mode (CodeMirror defaults + code.org tweaks). */
const lightThemeView = EditorView.theme(
  {
    '&': {
      backgroundColor: white,
    },
    '.cm-gutters': {
      backgroundColor: white,
      border: 'none',
      paddingInline: '0.25rem',
    },
    // Use the same wavy underline style for errors as the dark theme.
    '.cm-lintRange-error': {
      backgroundImage: 'none !important',
      textDecoration: 'underline wavy',
      textDecorationColor: red,
    },
  },
  {dark: false},
);

// A theme that sets just the editor font size. Kept separate from the light/dark
// themes so it stays constant across theme switches and can be reconfigured live
// from the Settings menu (legacy's `getFontSizeTheme`). The default is 13px
// (legacy FontSize.Small).
export const getFontSizeTheme = (fontSizePx: number): Extension =>
  EditorView.theme({
    '&': {fontSize: `${fontSizePx}px`},
  });

// Each theme bundles editor chrome + its own highlight style, so exactly one
// highlight style is active at a time. Light uses CodeMirror's default highlight
// style; dark uses the code.org One-Dark-derived style above.
export const lightTheme: Extension = [
  lightThemeView,
  syntaxHighlighting(defaultHighlightStyle),
];
export const darkTheme: Extension = [
  darkThemeView,
  syntaxHighlighting(darkHighlightStyle),
];
