import {EditorView} from '@codemirror/view';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  HighlightStyle
} from '@codemirror/language';
import {tags} from '@lezer/highlight';

const 
  charcoal = '#292f36',
  teal_light = '#5ecfe6',
  teal_lightest = '#7ee8f9',
  purple_light = '#ccb1df',
  strawberry = '#ed6060',
  off_white = '#f7f8fa',
  charcoal_8 = '#eeeeef',
  charcoal_16 = '#ddddedf',
  charcoal_32 = '#b9babc',
  charcoal_50 = '#94979b',
  blue = '#007acc';

/**
The editor theme styles for dark mode.
*/
export const darkTheme = EditorView.theme(
  {
    '&': {
      color: off_white,
      backgroundColor: charcoal
    },
    '.cm-content': {
      caretColor: blue
    },
    '&.cm-focused .cm-cursor': {borderLeftColor: blue},
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: charcoal_50
    },
    '.cm-panels': {backgroundColor: charcoal, color: charcoal_16},
    '.cm-panels button': {color: charcoal_8},
    '.cm-panels.cm-panels-top': {borderBottom: '2px solid black'},
    '.cm-panels.cm-panels-bottom': {borderTop: '2px solid black'},
    '.cm-searchMatch': {
      backgroundColor: '#72a1ff59',
      outline: '1px solid #457dff'
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#6199ff2f'
    },
    '.cm-activeLine': {backgroundColor: charcoal_50},
    '.cm-selectionMatch': {backgroundColor: '#aafe661a'},
    '.cm-matchingBracket, .cm-nonmatchingBracket': {
      backgroundColor: '#bad0f847',
      outline: '1px solid #515a6b'
    },
    '.cm-gutters': {
      backgroundColor: charcoal,
      color: charcoal_32,
      border: 'none'
    },
    '.cm-activeLineGutter': {
      backgroundColor: charcoal_50
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ddd'
    },
    '.cm-tooltip': {
      border: '1px solid #181a1f',
      backgroundColor: charcoal
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: charcoal_50,
        color: charcoal_16
      }
    },
    '.cm-textfield': {color: charcoal_8}
  },
  {dark: true}
);

/**
The highlighting style for code in the dark theme.
*/
export const darkHighlightStyle = HighlightStyle.define([
  {tag: tags.keyword, color: teal_light},
  {
    tag: [
      tags.name,
      tags.deleted,
      tags.character,
      tags.propertyName,
      tags.macroName,
      tags.definition(tags.name)
    ],
    color: teal_light
  },
  {
    tag: [tags.function(tags.variableName), tags.labelName],
    color: teal_lightest
  },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: strawberry
  },
  {
    tag: [tags.separator],
    color: off_white
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
      tags.namespace
    ],
    color: teal_light
  },
  {
    tag: [
      tags.operator,
      tags.operatorKeyword,
      tags.url,
      tags.escape,
      tags.regexp,
      tags.link,
      tags.special(tags.string)
    ],
    color: off_white
  },
  {tag: [tags.meta, tags.comment], color: charcoal_32},
  {tag: tags.strong, fontWeight: 'bold'},
  {tag: tags.emphasis, fontStyle: 'italic'},
  {tag: tags.strikethrough, textDecoration: 'line-through'},
  {tag: tags.link, color: stone, textDecoration: 'underline'},
  {tag: tags.heading, fontWeight: 'bold', color: strawberry},
  {
    tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
    color: teal_light
  },
  {tag: [tags.processingInstruction, tags.string, tags.inserted], color: off_white},
  {tag: tags.invalid, color: charcoal_32}
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
      backgroundColor: color.white
    },
    // Sets the background color for the left-hand side gutters
    '.cm-gutters': {
      backgroundColor: color.white
    }
  },
  {dark: false}
);

// Extension to enable the light theme (both the editor theme and the highlight style).
export const lightMode = [
  lightTheme,
  syntaxHighlighting(defaultHighlightStyle)
];
