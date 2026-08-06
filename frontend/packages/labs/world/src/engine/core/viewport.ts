// How big the world is, in world pixels.
//
// The game's native resolution: a fixed logical coordinate space that everything
// else scales to. Phaser's FIT mode letterboxes the canvas into whatever the
// preview pane happens to be, and the map editor draws this same rectangle as
// the region a map may place actors in — so a position means the same thing in
// both, whatever size either is on screen.
//
// SQUARE, and 320 on a side: ten 32-pixel tiles each way, which is the size the
// first levels are built at. A 16:9 strip is a television's shape, and the
// things a learner builds here are not televisions — a platform world is as much
// about falling as about walking, and a strip gives the falling a quarter of the
// room it gives the walking.
//
// Small on purpose. A world you can count in tiles is a world a beginner can
// hold in their head: "the floor is the bottom row" is a sentence about this
// world, and ten columns is few enough that a whole level fits on one screen
// with nothing off it. It is the world's NATIVE size, not its size on screen —
// the canvas is scaled up to whatever room the preview pane has.
//
// One definition, because there were two: the driver's and the map editor's, and
// a map drawn against one of them would have been drawn against a lie the moment
// they disagreed. `preview.html` carries the same numbers in CSS (it sizes the
// canvas box before Phaser boots, so there is nothing to re-fit) and is the one
// place that has to be kept in step by hand.
//
// It lives in `core` because a CAMERA needs it: a camera's position is the point
// it shows at the middle of the view (core/Camera), so its resting position is
// the middle of this rectangle, and the engine cannot state that without knowing
// how big the rectangle is. `src/runtime/viewport.ts` re-exports it, so the
// driver and the map editor still read it from where they always did.

/** The size of one tile, in pixels — the grid the map editor and the maps use. */
export const TILE_SIZE = 32;

/** The world in tiles, each way. */
export const VIEWPORT_TILES = 10;

/** The world's width in pixels — the map region, and the canvas's native size. */
export const VIEWPORT_WIDTH = VIEWPORT_TILES * TILE_SIZE;

/** The world's height in pixels. */
export const VIEWPORT_HEIGHT = VIEWPORT_TILES * TILE_SIZE;
