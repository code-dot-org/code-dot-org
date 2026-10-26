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
//   BOTH MAJOR VERSIONS       The two halves of that are not on the same one.
//     `@code-dot-org/fonts` points at a FontAwesome 6 PRO kit; this package
//     depends on FontAwesome 7 FREE. A major version is part of the family
//     NAME — 7 registers "Font Awesome 7 Free" and nothing under the 6 name —
//     so a list naming one version resolves in one kind of build and silently
//     draws boxes in the other. That is exactly what happened: the free demo
//     had every block button empty while the licensed build looked correct.
//     `fontAwesomeFamilies.test.ts` reads the installed package's own major
//     and fails if this list has fallen behind it.
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
 * Pro before Free at each major, because a licensed build has both and the Pro
 * faces draw more; newest major first, because a host that has upgraded should
 * not be served the older face it also still carries. Fallback here is
 * per-CODEPOINT rather than per-family, so a name for a font nobody loaded
 * costs nothing and is only ever the difference between a glyph and a box.
 *
 * `FontAwesome` is the version 4 and 5 family name, kept because a host that
 * loaded one of those still has it registered under that.
 *
 * EXPORTED because the progression map draws its own glyphs (the check and the
 * padlock on a tile) and needs the same list. Two copies of it is what let the
 * map keep working while the block buttons went blank.
 */
export const ICON_FAMILY = [
  '"Font Awesome 7 Pro"',
  '"Font Awesome 6 Pro"',
  '"Font Awesome 7 Free"',
  '"Font Awesome 6 Free"',
  '"FontAwesome"',
].join(', ');

/** Solid, which is the only weight the free package ships. */
export const ICON_WEIGHT = '900';

/**
 * Whether this build carries FontAwesome FREE rather than the design system's
 * Pro (`main.tsx`, `WORLD_DEMO_ICONS=free`).
 *
 * DECLARED RATHER THAN SNIFFED, for the reason `aiTutor/transport` gives at
 * length: reading `import.meta.env` here would inline one build's answer into
 * every consumer of this library. The harness knows which font it just asked
 * for, so the harness is what says so.
 */
let free = false;

/** Say that Free is the font. Called before anything renders, or not at all. */
export function useFreeIcons(): void {
  free = true;
}

/**
 * One glyph, as the `<tspan>` a `FieldButton` draws inside itself.
 *
 * `glyph` is the codepoint rather than the name — a font has no idea what
 * `sparkles` is — so every caller should say the name in a comment beside
 * the escape, because nobody can read ``.
 *
 * `freeGlyph` is THE SAME PICTURE OUT OF THE FREE SET, for the callers whose
 * icon is Pro-only. `src/freeIconShims.ts` does this for every icon drawn as
 * an element, by renaming the `--fa` property a class sets; it cannot do it
 * for these, because a codepoint in a `<tspan>` asks the font directly and a
 * font without that codepoint draws a box. Same silent failure, no CSS in the
 * way to intercept it, and `reportMissingIcons` will not find it either — that
 * walks `[class*="fa-"]`, and this is not one. So the substitution is made
 * here, by the caller, in the open. A caller whose glyph is in both sets
 * passes one argument and means it.
 */
export function glyphIcon(glyph: string, freeGlyph = glyph): SVGElement {
  const icon = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  ) as SVGElement;
  icon.style.fontFamily = ICON_FAMILY;
  icon.style.fontWeight = ICON_WEIGHT;
  icon.textContent = free ? freeGlyph : glyph;
  return icon;
}
