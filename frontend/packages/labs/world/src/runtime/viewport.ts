// The world's native size — see `engine/core/viewport`, which defines it.
//
// Re-exported rather than moved outright: the driver, the map editor and the
// placement grid all read it from here, and a camera's resting position made it
// something the engine has to know too. One definition, two names for the same
// door.

export {
  TILE_SIZE,
  VIEWPORT_HEIGHT,
  VIEWPORT_TILES,
  VIEWPORT_WIDTH,
} from '../engine/core/viewport';
