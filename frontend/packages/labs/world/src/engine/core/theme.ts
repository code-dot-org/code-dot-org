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
export function resolveTheme(document: unknown): ResolvedTheme {
  const source = (document ?? {}) as ThemeDocument;
  const tokens = source.tokens ?? {};
  const unresolved: string[] = [];
  const styles = new Map<string, ResolvedStyle>();

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
    styles.set(name, style);
  }

  return {
    name: String(source.name ?? ''),
    styles,
    unresolved,
  };
}
