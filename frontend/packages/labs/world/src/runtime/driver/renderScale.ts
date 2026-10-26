// How many device pixels the game draws per world pixel.
//
// The world is 320 by 320 (`core/viewport`) and that number is its COORDINATE
// SYSTEM, not its resolution: it is what a lesson means by "halfway down is
// 160", what every fixture's positions are written in, and what the map
// editor's grid counts. Nothing here changes it. What changes is how many real
// pixels each of those units is drawn with.
//
// It was one, and that was the whole of the problem. Phaser's FIT mode stretches
// the canvas to whatever the preview pane allows, and the pane is 460 CSS pixels
// in the split view and 900 to 1400 in fullscreen — so a 320-pixel canvas was
// being scaled by 1.44, 2.84, 3.25, 4.37. None of those is a whole number, and
// the canvas is drawn with `image-rendering: pixelated` (`pixelArt` below), so a
// 1.44 upscale draws 44% of the source rows two pixels tall and the rest one.
// Every sprite came out unevenly stretched and every letter came out mush —
// which reads as "low resolution" but is not: it is the wrong resolution being
// resampled badly.
//
// THREE, because three times 320 is 960, which is at or above the pane in every
// case measured: 960 into 460 is a clean downscale in the split view, and 960
// into 1039 is very nearly one-to-one in fullscreen on a 1080p screen. It is
// also a whole number, which keeps Phaser's `roundPixels` switched on — the
// camera turns it off for a fractional zoom (`Camera.preRender`).
//
// Everything that RASTERIZES has to know: a texture made at world-unit size and
// then drawn three times as large is exactly the fault this exists to remove,
// only moved one layer down. `drawingTextures` is the one that does, and the
// drawings are what the interface actors are made of — a label, a speech box, a
// health bar. Their images are scaled back down by the same factor where they
// are drawn, so a drawing still occupies the world units it declares.
//
// It is NOT a per-device number. Nothing here reads `devicePixelRatio`: a
// HiDPI screen doubles the stretch again, and the honest fix for that is to
// derive this from the pane rather than to guess. That is a change to make when
// there is a resize path to hang it on; three is enough that the guess is a
// good one either way.

/** Device pixels per world pixel. A whole number, deliberately. */
export const RENDER_SCALE = 3;
