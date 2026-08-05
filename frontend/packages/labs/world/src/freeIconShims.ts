// Icons the design system asks for that FontAwesome FREE does not draw.
//
// The demo can be built to carry its own icons (`WORLD_DEMO_ICONS=free`),
// because the Pro CDN answers CORS for code.org origins only and a webfont is
// always a CORS request — so a demo deployed anywhere else renders every icon
// as an empty box. Free covers most of what this lab asks for and not all of
// it, and a name Free has never heard of draws nothing at all: no error, no
// fallback glyph, just a gap where a button's picture should be.
//
// So each one gets a substitute here, and `reportMissingIcons` (below) is how
// the next one is found rather than noticed. FontAwesome 7 makes the
// substitution a one-liner: an icon's glyph is a custom property, so naming the
// same property with a different code point is the whole of it.

/** A Pro-only icon, and the Free glyph that stands in for it. */
interface Shim {
  /** The class the design system uses, without the `fa-` prefix. */
  name: string;
  /** The Free code point, and the name it belongs to (for the reader). */
  glyph: string;
  substitute: string;
}

/**
 * The map. Each entry is a judgement about what an icon MEANS, so it belongs
 * beside a note about where it appears — a stand-in that is merely a picture
 * of something is worse than a box.
 */
export const FREE_ICON_SHIMS: Shim[] = [
  {
    // The Codebridge header's "collapse the file browser" arrow: a bar with an
    // arrow going into it. Free's `angles-left` is the same gesture without the
    // bar, and reads as "push this to the left".
    name: 'arrow-left-from-line',
    glyph: '\\f100',
    substitute: 'angles-left',
  },
  {
    // Its opposite, on the same control.
    name: 'arrow-left-to-line',
    glyph: '\\f100',
    substitute: 'angles-left',
  },
  {
    // The reverses of the above
    name: 'arrow-right-from-line',
    glyph: '\\f101',
    substitute: 'angles-right',
  },
  {
    name: 'arrow-right-to-line',
    glyph: '\\f101',
    substitute: 'angles-right',
  },
];

/** The stylesheet those shims amount to. */
export function freeIconShimCss(shims: readonly Shim[] = FREE_ICON_SHIMS) {
  return shims
    .map(
      ({name, glyph, substitute}) =>
        `.fa-${name} { --fa: "${glyph}"; } /* ${substitute} */`,
    )
    .join('\n');
}

/**
 * Report every FontAwesome icon on the page that nothing draws.
 *
 * The gap this closes is that a missing icon is SILENT: FontAwesome renders
 * `--fa` as the `::before` content, and an unknown name leaves the property
 * unset, so the element is present, sized, and empty. Nobody notices until they
 * look at that corner of the screen.
 *
 * Called after the shell has rendered, and again as parts of it open — a menu's
 * icons do not exist until the menu does. Names are reported once each.
 */
const reported = new Set<string>();

export function reportMissingIcons(root: ParentNode = document): string[] {
  const missing: string[] = [];
  for (const element of root.querySelectorAll('[class*="fa-"]')) {
    const name = [...element.classList].find(
      className =>
        className.startsWith('fa-') &&
        !STYLE_AND_MODIFIER_CLASSES.test(className),
    );
    if (!name || reported.has(name)) {
      continue;
    }
    const drawn = getComputedStyle(element).getPropertyValue('--fa').trim();
    if (drawn) {
      continue;
    }
    reported.add(name);
    missing.push(name);
  }
  if (missing.length > 0) {
    console.warn(
      `World Lab: FontAwesome Free has no glyph for ${missing.join(', ')} — ` +
        `add a substitute to src/freeIconShims.ts`,
    );
  }
  return missing;
}

/** `fa-solid`, `fa-fw`, `fa-2x`, `fa-spin`… — a class that is not an icon. */
const STYLE_AND_MODIFIER_CLASSES =
  /^fa-(solid|regular|light|thin|duotone|brands|sharp|kit|fw|lg|xs|sm|xl|2xl|[0-9]+x|spin|spin-pulse|spin-reverse|pulse|beat|fade|bounce|shake|flip|flip-horizontal|flip-vertical|flip-both|rotate-90|rotate-180|rotate-270|rotate-by|border|inverse|stack|stack-1x|stack-2x|pull-left|pull-right|li|ul|layers|swap-opacity)$/;
