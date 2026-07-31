// Colors in, shader colors out.
//
// Two conventions meet here and neither is going to move. Every color picker a
// learner will ever use — Blockly's `colour_picker`, `colour_random`,
// `colour_blend`, the browser's own — speaks `#rrggbb`, one byte per channel.
// A shader uniform is a float per channel, 0 to 1. Someone has to convert, and
// doing it in the generated code rather than the block means ANY block that
// produces a color can feed an effect parameter, not just the one we shipped.
//
// So `add effect Tint / color [swatch]` generates `WorldLab.rgb("#ff8800")`,
// and a learner who later drops a `blend` block in its place gets the same
// treatment for free.
//
// Channels may also arrive as an array of floats, which is what the `r g b a`
// block produces. That block exists because hex cannot express what a learner
// wants when they reach past the swatch: an alpha, or a channel driven by a
// variable. Accepting both here rather than forcing everything through hex
// avoids a pointless round trip — numbers to a string to numbers — that would
// also quantize the learner's values to 8 bits on the way through.

/** A color as a shader wants it: three floats, 0–1. */
export type Rgb = [number, number, number];
/** The same, with opacity. */
export type Rgba = [number, number, number, number];

const clamp01 = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

/** What a color socket can hand over: a hex string, or floats already. */
export type ColorValue = string | readonly number[];

/**
 * Parse a color into four 0–1 floats, alpha last.
 *
 * Accepts `#rgb`, `#rrggbb`, `#rrggbbaa` and a float array. Hex without an
 * alpha means opaque — a picker has no way to say otherwise, and a color a
 * learner chose from a swatch is a color they expect to see.
 *
 * Lenient on input because the input comes from somewhere else — a picker, a
 * blend, a learner's own text. Anything unreadable is opaque black rather than
 * an exception: a shader uniform of NaN blanks the sprite with no message, and
 * a game that keeps running is easier to debug than one that stops.
 */
function channels(value: ColorValue): Rgba {
  if (Array.isArray(value)) {
    const at = (index: number, fallback: number) =>
      clamp01(Number(value[index] ?? fallback));
    return [at(0, 0), at(1, 0), at(2, 0), at(3, 1)];
  }
  const text = String(value ?? '').trim();
  const short = /^#?([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i.exec(text);
  const long =
    /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i.exec(text);
  const match = short ?? long;
  if (!match) {
    return [0, 0, 0, 1];
  }
  const byte = (part: string | undefined, fallback: number): number =>
    part === undefined
      ? fallback
      : parseInt(short ? part + part : part, 16) / 255;
  return [
    byte(match[1], 0),
    byte(match[2], 0),
    byte(match[3], 0),
    byte(match[4], 1),
  ];
}

/** A color as three 0–1 floats. Any alpha the value carries is dropped. */
export function rgb(value: ColorValue): Rgb {
  const [r, g, b] = channels(value);
  return [r, g, b];
}

/** The same with alpha, which defaults to opaque when the value omits one. */
export function rgba(value: ColorValue): Rgba {
  return channels(value);
}

/**
 * Back the other way: three 0–1 floats to `#rrggbb`.
 *
 * Needed because an effect declares its default color the shader way, and the
 * picker standing in for it on the block needs a hex swatch to show.
 */
export function toHex(color: readonly number[]): string {
  const channel = (index: number): string =>
    Math.round(clamp01(Number(color?.[index] ?? 0)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}
