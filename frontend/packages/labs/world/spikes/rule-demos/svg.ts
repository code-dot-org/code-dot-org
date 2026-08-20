// A world's frames as one self-contained SVG.
//
// The spike's question is "is a still worth anything, or does a rule only read
// in motion?", and the cheapest honest way to ask it is to produce both from
// the same recording: a `<rect>` per actor, and an `<animate>` per rect driving
// it through the positions the engine actually computed.
//
// SVG rather than a canvas or a sprite strip because it needs no renderer, no
// GPU and no build step — a file that opens in any browser and shows the real
// simulation. A real implementation would draw the actors' sprites through
// Phaser; this draws boxes, which is enough to answer the question and not
// enough to be mistaken for the feature.

/** One actor at one moment, as the engine reported it. */
export interface Snap {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colour: string;
}

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/**
 * The recording as an animated SVG, plus the frame a still would use.
 *
 * An actor that LEAVES — a collected coin — is animated to zero opacity at the
 * frame it went, because a rule whose whole point is that something disappears
 * cannot be shown by a picture in which it is still there.
 */
export function toSvg(
  frames: Snap[][],
  size: {width: number; height: number},
  seconds: number,
): string {
  const ids = [...new Set(frames.flat().map(snap => snap.id))];
  const at = (frame: Snap[], id: string) => frame.find(s => s.id === id);
  const first = (id: string) => frames.find(f => at(f, id))!;
  const values = (id: string, read: (snap: Snap) => number) =>
    frames
      .map(frame => {
        const found = at(frame, id);
        // Gone: hold the last place it was, and let opacity say it went.
        return found ? read(found) : read(at(first(id), id)!);
      })
      .join(';');
  const present = (id: string) =>
    frames.map(frame => (at(frame, id) ? 1 : 0)).join(';');

  const rects = ids.map(id => {
    const sample = at(first(id), id)!;
    const anim = (name: string, list: string) =>
      `<animate attributeName="${name}" values="${list}" dur="${seconds}s" ` +
      `repeatCount="indefinite" calcMode="discrete"/>`;
    return (
      `<rect id="${escape(id)}" width="${sample.width}" height="${sample.height}" ` +
      `fill="${sample.colour}" rx="2">` +
      anim(
        'x',
        values(id, s => s.x - s.width / 2),
      ) +
      anim(
        'y',
        values(id, s => s.y - s.height / 2),
      ) +
      anim('opacity', present(id)) +
      `</rect>`
    );
  });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" ` +
    `height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">` +
    `<rect width="100%" height="100%" fill="#101020"/>` +
    rects.join('') +
    `</svg>`
  );
}

/** One frame, unanimated — what a still in the dialog would be. */
export function toStill(
  frames: Snap[][],
  index: number,
  size: {width: number; height: number},
): string {
  const frame = frames[Math.min(index, frames.length - 1)];
  const rects = frame.map(
    snap =>
      `<rect x="${snap.x - snap.width / 2}" y="${snap.y - snap.height / 2}" ` +
      `width="${snap.width}" height="${snap.height}" fill="${snap.colour}" rx="2"/>`,
  );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" ` +
    `height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">` +
    `<rect width="100%" height="100%" fill="#101020"/>` +
    rects.join('') +
    `</svg>`
  );
}
