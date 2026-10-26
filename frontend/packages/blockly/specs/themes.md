# Themes

The package's ten themes: the default one (`definitions.md`, DEF-45), a
high-contrast one, one for each of three kinds of colour blindness, and a
dark variant of each of those five. A theme decides the colour of every
block style, the font, and the colours of the toolbox, flyout and
workspace.

## Why it exists

Students choose a block palette in a lab's settings. The choice is saved to
their account by the theme's name, so it follows them between labs and
devices. The palettes for colour blindness and high contrast make blocks
distinguishable to students who cannot tell the default colours apart, and
the dark variants follow the site's dark mode.

## The themes

THM-1. The package defines these themes:

| Name                 | Menu label               | Blockly base                  | Font size | Dark |
| -------------------- | ------------------------ | ----------------------------- | --------- | ---- |
| `default`            | Modern Theme             | Blockly's Classic             | 11        | no   |
| `default-dark`       | Modern Dark Theme        | `@blockly/theme-dark`         | 11        | yes  |
| `high-contrast`      | High Contrast Theme      | `@blockly/theme-highcontrast` | 16        | no   |
| `high-contrast-dark` | High Contrast Dark Theme | `@blockly/theme-highcontrast` | 16        | yes  |
| `protanopia`         | Protanopia Theme         | Blockly's Classic             | 11        | no   |
| `protanopia-dark`    | Protanopia Dark Theme    | `@blockly/theme-dark`         | 11        | yes  |
| `deuteranopia`       | Deuteranopia Theme       | Blockly's Classic             | 11        | no   |
| `deuteranopia-dark`  | Deuteranopia Dark Theme  | `@blockly/theme-dark`         | 11        | yes  |
| `tritanopia`         | Tritanopia Theme         | Blockly's Classic             | 11        | no   |
| `tritanopia-dark`    | Tritanopia Dark Theme    | `@blockly/theme-dark`         | 11        | yes  |

THM-2. A theme's name is saved in students' settings. A name must never
change, and a removed theme's name must keep resolving to something.

THM-3. `themes` maps every theme's name to the theme. `themeOptions` lists
`{value, text}` for the five light themes, in the order `default`,
`high-contrast`, `protanopia`, `deuteranopia`, `tritanopia`, with each
theme's name and menu label. This is what a settings menu offers; lab-base
offers exactly this list.

THM-4. Every theme in `themeOptions` has a dark variant named
`<name>-dark`. A lab that follows the site's dark mode finds the variant
by that name.

THM-5. The dark variants' names contain `dark`, so the renderer darkens
their secondary colours (DEF-38, DEF-40). No light theme's name contains
`dark`.

THM-6. Every theme names a style for every key `definitions.md` requires
(DEF-45). Blockly draws a block whose style its theme does not define in
black, so the `Theme` type makes a missing style a compile error.
`ai_blocks`, Dance AI Edition's, is `#566065` in every theme, as in apps.

THM-7. A theme gives each style a primary colour only, and leaves the
secondary and tertiary colours to the renderer, which darkens them under a
dark theme (DEF-38). The exception is `variable_blocks`, whose secondary
colour is its primary, because the only shadow blocks of that style are
argument reporters. The high-contrast themes delete the secondary and
tertiary colours of their base's styles, so that the styles they do not
redefine (Blockly's own, such as `list_blocks`) follow the same rule.

That deletion happens when `themes/highContrast` or
`themes/highContrastDark` is first imported, and changes the object
`@blockly/theme-highcontrast` exports, for everyone on the page.

THM-8. Every theme takes the default theme's font family and weight. The
high-contrast themes' font size is 16 because their definitions give no
size, and Blockly takes the size from their base; every other theme gives 11.

THM-9. The light themes' toolbox is `#dddddd`. The dark variants share
`default-dark`'s component colours: toolbox `#394450`; workspace
`var(--neutral-base-black)`; flyout `var(--neutral-gray-95)` at opacity
0.8. Their `blackBackground` key is not one Blockly reads.

THM-10. Every theme takes its block-limit and trashcan colours from the
default theme. Those, and the dark variants' workspace and flyout colours,
are design-system CSS variables, which a page must load for them to show
(`frontend/packages/component-library-styles/colors.css`).

THM-11. The colour-blindness palettes are apps' (`protanopiaBlockStyles`,
`deuteranopiaBlockStyles` and `tritanopiaBlockStyles` in
`apps/src/blockly/themes/cdoAccessibleStyles.js`), colour for colour, with
`comment_blocks` added. A dark variant has its light theme's block styles
and `default-dark`'s other colours.

## Test vectors

THM-V1 (THM-3, THM-4). For each `{value}` of `themeOptions`,
`themes[value]` and `themes[value + '-dark']` both exist, and only the
second is dark by `isDarkTheme`.

THM-V2 (THM-8). `themes['high-contrast'].instance.fontStyle.size` is 16;
`themes.protanopia.instance.fontStyle.size` is 11.

THM-V3 (THM-11). `themes.protanopia.definition.blockStyles.loop_blocks`
has the primary colour of apps' `protanopiaBlockStyles.loop_blocks`.

## Not specified here

- How a theme is applied to a workspace: `workspace.md`, WS-6, WS-19.
- How the renderer derives secondary colours: `definitions.md`, DEF-38.
- Jigsaw's theme, which is Jigsaw's own.

## Open questions

1. THM-7: copy `@blockly/theme-highcontrast`'s styles rather than change the
   module's own object?
2. THM-9: drop `blackBackground`, or is something meant to read it?
