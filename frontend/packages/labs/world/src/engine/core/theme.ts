// A theme: named values, and named bundles of paint made out of them.
//
// THE POINT IS THAT A DRAWING STOPS ENCODING THE LOOK. A Button's routine used
// to say "fill accent, outline accent-edge at one pixel, corner eight" — so
// the RELATIONSHIP was in the drawing, and a bordered Classic and a shadowed
// borderless Modern could not both come out of it without the drawing
// branching. It now says `use style ⟨button face⟩`, and what that means is a
// file the project points at (specs/STYLES_PLAN.md).
//
// TWO LEVELS, WHICH IS CSS CUSTOM PROPERTIES AND CLASSES, arrived at for the
// same reason. `accent` appears in a Button's face, a Dropdown's chosen row, a
// List's chosen row and a Slider's fill; if each of those held its own literal
// then recolouring meant editing four styles, which is the copy-paste problem
// moved up one level rather than fixed. So a TOKEN is a named value and a
// STYLE is a bundle that refers to tokens by name.
//
// WHAT IS DELIBERATELY NOT TAKEN FROM CSS: the cascade. No selectors, no
// specificity, no inheritance down the parent chain. Styles are flat and
// resolved by name. Specificity is the most confusing thing in CSS for people
// who write it for a living, and this is a language for people who do not.
//
// AND IT RESOLVES TO VALUES BEFORE ANYTHING IS DRAWN. A command carries the
// paint it was drawn with, and the command list is the drawing's identity
// (`drawingKey`) — so carrying a style NAME into a command would make two
// themes hash to one key, and the second would be served the first's picture.
// `useStyle` hands the pen numbers and colours, never a name.

import {cssColor, type ColorValue} from './color';
import type {Shadow} from './drawing';

/** A reference to a token, as it is written in a file: `$accent`. */
const REFERENCE = /^\$(.+)$/;

/** What a `.style` file holds. Every part of it is optional, on purpose. */
export interface ThemeDocument {
  /** What to call it in a menu. The file name does if this is missing. */
  name?: string;
  /**
   * One file this one is a difference from, by module path.
   *
   * THE MOMENT A PLACEMENT CAN POINT AT ITS OWN FILE, a file holding only
   * what differs is the obvious thing to want — and without this it does not
   * work, because a class a file does not define leaves the pen alone, so a
   * `danger.style` holding one class draws the rest of the control in
   * whatever came before. The alternative is that every variant is a full
   * copy of the base, which drifts the moment the base changes
   * (specs/STYLES_PLAN.md).
   *
   * ONE PARENT, MERGED ONCE, class by class and then field by field. No
   * selectors, no specificity, no chain of actors to walk: this is `acts
   * like` for a theme, and it is resolved the way that is.
   */
  extends?: string;
  /** Named values — `accent`, `radius`, `ink`. Referred to as `$accent`. */
  tokens?: Record<string, string | number>;
  /** Named bundles. A drawing names one of these. */
  styles?: Record<string, StyleSpec>;
}

/**
 * One named style, as written.
 *
 * ABSENT AND NULL MEAN DIFFERENT THINGS, which is the whole of how these
 * compose. A field this does not mention LEAVES THE PEN ALONE — so `use style
 * ⟨chosen row⟩` after `use style ⟨menu⟩` can change the fill and keep the
 * corner. A field written as `null` says the absence out loud: no fill, no
 * outline, no shadow. Without the distinction a style could only ever be a
 * complete pen, and every style would have to restate everything.
 */
export interface StyleSpec {
  fill?: string | null;
  stroke?: string | null;
  strokeWidth?: number | string;
  corner?: number | string;
  shadow?: {color: string; blur: number | string; down: number | string} | null;
  weight?: 'bold' | 'normal';
}

/** The same with every reference followed — what the pen is actually handed. */
export interface ResolvedStyle {
  fill?: string | null;
  stroke?: string | null;
  strokeWidth?: number;
  corner?: number;
  shadow?: Shadow | null;
  weight?: 'bold' | 'normal';
}

export interface ResolvedTheme {
  name: string;
  /** Every token, the parent's under this file's — what a preview reads. */
  tokens: Record<string, string | number>;
  styles: ReadonlyMap<string, ResolvedStyle>;
  /**
   * Every `$name` in the file that named no token.
   *
   * KEPT RATHER THAN THROWN, and kept rather than dropped silently. A theme is
   * data a project edits, so a typo in one is ordinary; a typo that draws
   * nothing and says nothing is the failure this lab keeps meeting
   * (specs/BOXES_PLAN.md, "The election that elected nothing"). The style is
   * still built out of whatever else resolved, and this is what a sandbox or
   * an editor reports.
   */
  unresolved: readonly string[];
}

/** An empty one, which is what a world with no theme answers from. */
export const NO_THEME: ResolvedTheme = {
  name: '',
  tokens: {},
  styles: new Map(),
  unresolved: [],
};

/**
 * Follow a value: `$name` through the tokens, anything else as itself.
 *
 * ONE HOP, not a chain. A token whose value is another `$name` is not
 * resolved, because a token that refers to a token is the beginning of the
 * cascade this is built to avoid — and the failure mode of following them is a
 * cycle, which is a hang rather than a wrong colour.
 */
function follow(
  value: string | number | undefined,
  tokens: Record<string, string | number>,
  unresolved: string[],
): string | number | undefined {
  if (typeof value !== 'string') {
    return value;
  }
  const match = REFERENCE.exec(value);
  if (!match) {
    return value;
  }
  const found = tokens[match[1]];
  if (found === undefined) {
    unresolved.push(value);
    return undefined;
  }
  return found;
}

const asNumber = (value: string | number | undefined): number | undefined => {
  const number = typeof value === 'string' ? Number(value) : value;
  return number === undefined || !Number.isFinite(number) ? undefined : number;
};

const asColor = (value: string | number | undefined): string | undefined =>
  value === undefined ? undefined : cssColor(String(value) as ColorValue);

/**
 * Read a theme document into something the pen can be handed.
 *
 * LENIENT THROUGHOUT. The document is JSON a project owns and an editor wrote;
 * anything unreadable in it costs that one field and nothing else. A theme
 * that threw would take down every drawing in the world, which is a worse
 * answer to a typo than a button with no corner.
 */
export function resolveTheme(
  document: unknown,
  /**
   * How to find a named parent, or nothing to resolve a file on its own.
   *
   * A FUNCTION RATHER THAN A MAP OF EVERY FILE, because the two callers know
   * different things: the driver has the project's modules and the map
   * editor's reader has its text. Both can answer "the document at this
   * path"; neither wants to hand over the lot.
   */
  parentAt?: (path: string) => unknown,
  seen: readonly string[] = [],
): ResolvedTheme {
  const source = (document ?? {}) as ThemeDocument;
  const unresolved: string[] = [];

  // THE PARENT FIRST, so this file's own rows overwrite it. A cycle is
  // guarded rather than followed: a file that extends itself, directly or
  // round a ring, is a project that hangs otherwise, and a hang says nothing
  // about which file did it.
  let inherited = NO_THEME;
  const parent = typeof source.extends === 'string' ? source.extends : '';
  if (parent && parentAt) {
    if (seen.includes(parent)) {
      unresolved.push(`extends ${parent}`);
    } else {
      inherited = resolveTheme(parentAt(parent), parentAt, [...seen, parent]);
      unresolved.push(...inherited.unresolved);
    }
  }

  // …and the parent's tokens under this file's, so a variant can say only the
  // one colour it changes and still read every other name.
  const tokens = {...inherited.tokens, ...(source.tokens ?? {})};
  const styles = new Map<string, ResolvedStyle>(inherited.styles);

  for (const [name, spec] of Object.entries(source.styles ?? {})) {
    if (!spec || typeof spec !== 'object') {
      continue;
    }
    const style: ResolvedStyle = {};
    // `in` rather than a truthiness test, because null is a value here and
    // means something different from absent.
    if ('fill' in spec) {
      style.fill =
        spec.fill === null
          ? null
          : (asColor(follow(spec.fill, tokens, unresolved)) ?? null);
    }
    if ('stroke' in spec) {
      style.stroke =
        spec.stroke === null
          ? null
          : (asColor(follow(spec.stroke, tokens, unresolved)) ?? null);
    }
    if ('strokeWidth' in spec) {
      style.strokeWidth = asNumber(
        follow(spec.strokeWidth, tokens, unresolved),
      );
    }
    if ('corner' in spec) {
      style.corner = asNumber(follow(spec.corner, tokens, unresolved));
    }
    if ('weight' in spec) {
      style.weight = spec.weight === 'bold' ? 'bold' : 'normal';
    }
    if ('shadow' in spec) {
      const cast = spec.shadow;
      style.shadow =
        cast === null || !cast
          ? null
          : {
              color:
                asColor(follow(cast.color, tokens, unresolved)) ?? '#000000',
              blur: Math.max(
                0,
                asNumber(follow(cast.blur, tokens, unresolved)) ?? 0,
              ),
              offsetY: asNumber(follow(cast.down, tokens, unresolved)) ?? 0,
            };
    }
    // FIELD BY FIELD over the parent's, not instead of it: a variant that
    // says `{"button": {"fill": "$danger"}}` means "the button, but red",
    // which is the whole reason a file may extend one.
    styles.set(name, {...styles.get(name), ...style});
  }

  return {
    name: String(source.name ?? ''),
    tokens,
    styles,
    unresolved,
  };
}
