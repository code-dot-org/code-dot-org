// How big the world is, in world pixels.
//
// The game's native resolution: a fixed logical coordinate space that everything
// else scales to. Phaser's FIT mode letterboxes the canvas into whatever the
// preview pane happens to be, and the map editor draws this same rectangle as
// the region a map may place actors in — so a position means the same thing in
// both, whatever size either is on screen.
//
// SQUARE, and 800 on a side. A 16:9 strip is a television's shape, and the
// things a learner builds here are not televisions: a platform world is as much
// about falling as about walking, and a strip gives the falling a quarter of the
// room it gives the walking. A square also matches the shape of the pane it
// lives in more often than not, which is what decides how much of the screen the
// game actually gets.
//
// One definition, because there were two: the driver's and the map editor's, and
// a map drawn against one of them would have been drawn against a lie the moment
// they disagreed. `preview.html` carries the same numbers in CSS (it sizes the
// canvas box before Phaser boots, so there is nothing to re-fit) and is the one
// place that has to be kept in step by hand.

/** The world's width in pixels — the map region, and the canvas's native size. */
export const VIEWPORT_WIDTH = 800;

/** The world's height in pixels. */
export const VIEWPORT_HEIGHT = 800;
