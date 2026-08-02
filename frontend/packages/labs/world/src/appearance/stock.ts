// The appearance library a project can copy from.
//
// NOTHING here is available to a game until it has been imported. A World
// project draws only what it holds: an image an actor wears is a file in the
// project, and an animation is a `.anim` in the project that reads rectangles
// out of one. That is the whole point of the library — it is a shelf, not a
// runtime.
//
// The same shape as the stock effects and stock rules: an id that becomes a file
// name, a name and a sentence for the picker, and the thing itself. Importing
// one copies it in, and from that moment it is the learner's — repaintable,
// renamable, deletable, and nothing outside the project depends on it.

import type {AnimationFile} from '../engine';

import type {SheetFile} from './sheetFile';
import {STOCK_IMAGES} from './stockImages';

/** Frame (and static image) edge length of every stock drawing, in pixels. */
export const STOCK_CELL = 32;

export interface StockSprite {
  /** File stem this is imported as — `player` becomes `sprites/player.png`. */
  id: string;
  /** What it is, for the picker. */
  name: string;
  /** One line on what it is for. */
  description: string;
  /** The image itself, as a `data:` URL (stockImages). */
  dataUrl: string;
  /**
   * How to cut it into cells, for the ones that are grids.
   *
   * Imported as a `.sheet` beside the image (appearance/sheetFile). A drawing
   * without one is a picture, not a spritesheet — nothing about the PNG says
   * which it is, so the library says.
   */
  sheet?: SheetFile;
}

export interface StockAnimation {
  /** File stem this is imported as — `coinSpin` becomes `animations/coinSpin.anim`. */
  id: string;
  /** What it is, for the picker. */
  name: string;
  /** One line on what it does. */
  description: string;
  /** Sprite ids it draws, imported alongside it — an animation is frames OF something. */
  sprites: readonly string[];
  /** The `.anim` document written into the project. */
  document: AnimationFile;
}

const image = (id: string): string => {
  const dataUrl = STOCK_IMAGES[id];
  if (!dataUrl) {
    throw new Error(`no stock image named "${id}"`);
  }
  return dataUrl;
};

/** Every stock grid is a row of squares the size of one drawing. */
const SQUARE_CELLS: SheetFile = {
  type: 'sheet',
  cell: {width: STOCK_CELL, height: STOCK_CELL},
};

/** The file name a stock sprite is imported under — what a frame references. */
export const spriteFileName = (id: string): string => `${id}.png`;

/**
 * One animation over a horizontal strip of `STOCK_CELL` cells.
 *
 * The cell rectangles are written out rather than implied: the driver reads a
 * rectangle from a plain image, so a strip is not a kind of asset — it is an
 * image this animation happens to read six squares out of.
 */
function strip(
  sprite: string,
  frames: number,
  frameRate: number,
  loop = true,
): AnimationFile['animations'][string] {
  return {
    loop,
    // The timing said once, on the animation, rather than copied onto every
    // frame: a strip has ONE rate, and six copies of it are six things to keep
    // in step by hand (animationTypes.frameDelay).
    frameRate,
    frames: Array.from({length: frames}, (_unused, index) => ({
      sprite: spriteFileName(sprite),
      position: {
        x: index * STOCK_CELL,
        y: 0,
        width: STOCK_CELL,
        height: STOCK_CELL,
      },
    })),
  };
}

/** One animation that scales a single image, rather than reading a strip. */
function pulse(
  sprite: string,
  scales: readonly number[],
  frameRate: number,
): AnimationFile['animations'][string] {
  return {
    frameRate,
    frames: scales.map(scale => ({
      sprite: spriteFileName(sprite),
      scale,
    })),
  };
}

/** The images, in the order the picker offers them. */
export const STOCK_SPRITES: readonly StockSprite[] = [
  {
    id: 'player',
    name: 'Player',
    description: 'A small character, facing the camera.',
    dataUrl: image('player'),
  },
  {
    id: 'ground',
    name: 'Ground',
    description: 'A grass-topped tile of earth, for floors and platforms.',
    dataUrl: image('ground'),
  },
  {
    id: 'coin',
    name: 'Coin',
    description: 'A gold coin, for something to collect.',
    dataUrl: image('coin'),
  },
  {
    id: 'box',
    name: 'Box',
    description: 'A wooden crate, for something to push or stack.',
    dataUrl: image('box'),
  },
  {
    id: 'ball',
    name: 'Ball',
    description: 'A red ball, for something to bounce.',
    dataUrl: image('ball'),
  },
  {
    id: 'playerWalk',
    name: 'Player Walking',
    description: 'Four frames of the player mid-stride, side by side.',
    dataUrl: image('playerWalk'),
    sheet: SQUARE_CELLS,
  },
  {
    id: 'coinSpin',
    name: 'Coin Spinning',
    description: 'Six frames of a coin turning, side by side.',
    dataUrl: image('coinSpin'),
    sheet: SQUARE_CELLS,
  },
  {
    id: 'switch',
    name: 'Switch',
    description: 'Six frames of a switch flipping over, side by side.',
    dataUrl: image('switch'),
    sheet: SQUARE_CELLS,
  },
];

/** The animations, in the order the picker offers them. */
export const STOCK_ANIMATIONS: readonly StockAnimation[] = [
  {
    id: 'coinSpin',
    name: 'Coin Spin',
    description: 'A coin turning on the spot, over and over.',
    sprites: ['coinSpin'],
    document: {
      type: 'animation',
      animations: {coinSpin: strip('coinSpin', 6, 12)},
    },
  },
  {
    id: 'playerWalk',
    name: 'Player Walk',
    description: 'A walking stride, for a character on the move.',
    sprites: ['playerWalk'],
    document: {
      type: 'animation',
      animations: {playerWalk: strip('playerWalk', 4, 8)},
    },
  },
  {
    id: 'switch',
    name: 'Switch',
    description:
      'A switch flipping from one side to the other — plays once and holds.',
    sprites: ['switch'],
    document: {
      type: 'animation',
      animations: {switchFlip: strip('switch', 6, 12, false)},
    },
  },
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'A gentle grow and shrink, made by scaling one image.',
    sprites: ['ball'],
    document: {
      type: 'animation',
      animations: {pulse: pulse('ball', [0.7, 1, 1.3, 1], 6)},
    },
  },
  {
    id: 'playerBob',
    name: 'Player Bob',
    description: 'A character bobbing on the spot, made by scaling one image.',
    sprites: ['player'],
    document: {
      type: 'animation',
      animations: {
        playerBob: pulse('player', [1, 1.25, 1, 0.8], 7),
      },
    },
  },
];

/** Look a stock sprite up by its id. */
export function stockSprite(id: string): StockSprite | undefined {
  return STOCK_SPRITES.find(sprite => sprite.id === id);
}

/** Look a stock animation up by its id. */
export function stockAnimation(id: string): StockAnimation | undefined {
  return STOCK_ANIMATIONS.find(animation => animation.id === id);
}
