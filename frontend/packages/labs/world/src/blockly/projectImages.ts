// The project's images, for the two dropdowns that name one.
//
// `set sprite ⟨player ▾⟩` and `set background to ⟨cave ▾⟩` said the NAME of a
// picture, and they are the two dropdowns in the lab where the thing being
// chosen is itself a picture. The actor dropdowns have shown their actors since
// the thumbnails arrived (`moduleOptions.pictured`); this is the same move for
// the images those thumbnails are made of, and it needs no rendering at all — a
// sprite IS the image, already decoded in the editor for the pickers to draw.
//
// PUSHED HERE rather than read from a context, the same arrangement
// `actorThumbnails` documents and for the same reason: a Blockly field is not
// in the React tree and cannot reach one.
//
// Missing is a fine answer, and a common one: an image still decoding, or a
// project opened a moment ago, falls back to the name — which is exactly what
// the dropdown said before.

/** Image URLs by file name (`player.png`, `cave.png`), as the editor decoded them. */
let images: Record<string, string> = {};

/** Replace what the picture dropdowns draw. */
export function setProjectImages(next: Record<string, string>): void {
  images = next;
}

/** The image for a file name, or undefined if none has arrived. */
export function projectImage(name: string): string | undefined {
  return images[name];
}
