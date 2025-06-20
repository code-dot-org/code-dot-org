/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 */
export enum SquareType {
  OPEN = 0,
  SPRITEFINISH = 1,
  NOT_USED_2 = 2,
  WALL = 4, // random wall tile
  NOT_USED_8 = 8,
  SPRITESTART = 16,
  ITEM_CLASS_0 = 32, // Must stay in sync with SquareItemClassShift below
  ITEM_CLASS_1 = 64,
  ITEM_CLASS_2 = 128,
  ITEM_CLASS_3 = 256,
  ITEM_CLASS_4 = 512,
  ITEM_CLASS_5 = 1024,
  ITEM_CLASS_6 = 2048,
  ITEM_CLASS_7 = 4096,
  NOT_USED_8K = 8192,
  NOT_USED_16K = 16384,
  NOT_USED_32K = 32768,
  // Walls specifically retrieved from an 16x16 grid are stored in bits 16-27.
}

export enum SpriteSpeed {
  VERY_SLOW = 2,
  SLOW = 3,
  LITTLE_SLOW = 4,
  NORMAL = 5,
  LITTLE_FAST = 6,
  FAST = 8,
  VERY_FAST = 12,
}

export const WallTypeMask = 0x0f000000;
export const WallCoordRowMask = 0x00f00000;
export const WallCoordColMask = 0x000f0000;

export const WallCoordsMask =
  WallTypeMask | WallCoordRowMask | WallCoordColMask;
export const WallCoordsShift = 16;
export const WallAnyMask = WallCoordsMask | SquareType.WALL;

export const RANDOM_VALUE = 'random';
