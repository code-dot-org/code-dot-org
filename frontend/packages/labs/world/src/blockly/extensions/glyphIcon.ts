// A FontAwesome glyph, drawn inside a block.
//
// A block is SVG, so an icon here cannot be the `<i>` element the icon
// component renders — it is a `<tspan>` in the icon font, and the three button
// extensions beside this file all draw one (`openSourceButton`,
// `lessonButton`, `enhanceButton`).
//
// THE FAMILY LIST IS THE WHOLE OF THIS MODULE, and it is here rather than
// repeated three times because getting it wrong is invisible. A missing family
// does not throw and does not warn: the glyph falls through to whatever font
// comes next, which has nothing at that codepoint, and the button draws an
// empty box. Three copies of a string is three chances to fix it in one place
// and not the others.
//
// Two things in it are load-bearing:
//
//   "Font Awesome 6 Free"   The lab's own font list names the PRO faces
//     (`@code-dot-org/fonts`), because that is what a licensed build loads. A
//     build without the kit has the free package instead — the lab already
//     depends on it for the design system's icons, and `blockly/actorIcons`
//     reads its drawings directly — and the free faces register under this
//     name and no other. Without it every one of these buttons is a box in any
//     build that is not licensed.
//
//   font-weight 900         The free package ships SOLID and BRANDS and no
//     regular face at all. A glyph asked for at the default weight matches no
//     face in the family, so the family is skipped and the codepoint falls
//     through exactly as if the family had not been named. The Pro faces are
//     forgiving about this and the free ones are not, which is why it looks
//     like it works right up until the build that matters.

/**
 * The icon font, in the order a browser should try it.
 *
 * `FontAwesome` is the version 4 and 5 family name, kept because a host that
 * loaded one of those still has it registered under that.
 */
const ICON_FAMILY =
  '"Font Awesome 6 Pro", "Font Awesome 6 Free", "FontAwesome"';

/** Solid, which is the only weight the free package ships. */
const ICON_WEIGHT = '900';

/**
 * One glyph, as the `<tspan>` a `FieldButton` draws inside itself.
 *
 * `glyph` is the codepoint rather than the name — a font has no idea what
 * `wand-magic` is — so every caller should say the name in a comment beside
 * the escape, because nobody can read ``.
 */
export function glyphIcon(glyph: string): SVGElement {
  const icon = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  ) as SVGElement;
  icon.style.fontFamily = ICON_FAMILY;
  icon.style.fontWeight = ICON_WEIGHT;
  icon.textContent = glyph;
  return icon;
}
