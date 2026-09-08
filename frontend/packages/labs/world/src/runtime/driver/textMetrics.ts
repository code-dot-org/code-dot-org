// How wide a line of text is — the one thing the engine cannot work out alone.
//
// The engine is DOM-free by design: it describes a picture and something else
// paints it (specs/DRAWING.md). That held for as long as nothing in the engine
// needed to know how wide a word was — `draw paragraph` hands its column DOWN
// and the painter decides where the lines break, precisely so the engine never
// had to ask.
//
// A CARET IS WHAT BROKE IT. A caret sits after the last letter typed, and
// where that is depends on the letters; worse, it MOVES on a click, and a
// click is a handler rather than a paint. A dimension published by the last
// frame's drawing — which is how `intrinsic size` already flows — cannot
// answer a question asked in the frame it is asked in.
//
// So the measuring tape is handed the other way: the driver gives the World a
// function (`World.useTextMetrics`) and the World lends it to blocks. It is
// built here, next to the painter, out of the same `fontAt` — one font string,
// so the measurement and the drawing are of the same text.
//
// A WORLD THAT WAS HANDED NONE MEASURES NOTHING, and says so by answering
// zero. That is the headless case — `runtime/playCheck` runs a world with no
// canvas anywhere — and a zero is a caret parked at the left margin, which is
// visibly nothing rather than invisibly wrong. A guess from a character count
// would be off by a little at one text size and by a word at another.

import {fontAt} from './paintDrawing';

/** What a World is handed: how wide `text` is, set at `size` pixels. */
export type TextMeasure = (text: string, size: number) => number;

/**
 * A measurer backed by a canvas of this document's own, or nothing.
 *
 * ONE CANVAS for the life of the page, never attached and never drawn on:
 * `measureText` needs a context and a font, and nothing else. Making one per
 * question would be a canvas per frame per field.
 *
 * `getContext` returning null is a real answer, not a failure to check for: a
 * test environment without a canvas implementation gives one, and the caller
 * is expected to leave the World unmeasured rather than to throw.
 */
export function browserTextMetrics(): TextMeasure | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }
  const context = document.createElement('canvas').getContext('2d');
  if (!context) {
    return undefined;
  }
  return (text, size) => {
    context.font = fontAt(size);
    return context.measureText(text).width;
  };
}
