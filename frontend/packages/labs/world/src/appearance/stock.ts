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
import {getBackgroundBaseUrl} from '../runtime/worldConfig';

import type {SheetFile} from './sheetFile';
import {STOCK_BACKGROUND_IDS} from './stockBackgrounds';
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

/**
 * The sprites a picture picker should offer: every stock image EXCEPT the ones
 * that exist only as an animation's frames.
 *
 * A strip is a truthful picture of a file and a useless one to place: six
 * coins in a row is not a coin, and an actor given `coinSpin.png` as its
 * picture draws all six at once. They are in the library because an animation
 * import has to bring its frames with it, and they are offered by the
 * ANIMATION picker, where they read as what they are.
 *
 * Worked out from the animations rather than flagged on the sprites, so that a
 * new animation takes its own strip out of the picture list by existing — a
 * flag would be a second place to remember.
 */
export const pictureSprites = (): readonly StockSprite[] => {
  const framesOfAnimations = new Set(
    STOCK_ANIMATIONS.flatMap(animation => animation.sprites),
  );
  return STOCK_SPRITES.filter(sprite => !framesOfAnimations.has(sprite.id));
};

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
    id: 'ship',
    name: 'Ship',
    description: 'A dart-shaped ship, pointing up — for something you steer.',
    dataUrl: image('ship'),
  },
  {
    id: 'asteroid',
    name: 'Asteroid',
    description: 'A chunky gray rock, for something to dodge or break apart.',
    dataUrl: image('asteroid'),
  },
  {
    id: 'energyBall',
    name: 'Energy Ball',
    description:
      'A glowing blue orb — for something an actor sends across the screen.',
    dataUrl: image('energyBall'),
  },
  {
    id: 'door',
    name: 'Door',
    description: 'A panelled wooden door, for a way out of the room.',
    dataUrl: image('door'),
  },
  {
    id: 'post',
    name: 'Post',
    description: 'A banded wooden post, for a landmark or a place to reach.',
    dataUrl: image('post'),
  },
  {
    id: 'flag',
    name: 'Flag',
    description: 'A chequered flag on a pole, for the end of the level.',
    dataUrl: image('flag'),
  },
  {
    id: 'spike',
    name: 'Spike',
    description: 'A row of metal teeth on a plate, for something that damages.',
    dataUrl: image('spike'),
  },
  {
    id: 'fuelCan',
    name: 'Fuel Can',
    description:
      'A red jerry can, for something that fills a tank — a jetpack’s, or anything else that runs out.',
    dataUrl: image('fuelCan'),
  },
  {
    id: 'fuelCanSmall',
    name: 'Small Fuel Can',
    description:
      'The same can, smaller. Worth less than the big one, and readable as less from across the room.',
    dataUrl: image('fuelCanSmall'),
  },
  {
    id: 'robot',
    name: 'Tracked Robot',
    description:
      'A boxy robot on a tank track with one red eye, for something that goes along the floor and takes ladders.',
    dataUrl: image('robot'),
  },
  {
    id: 'pinball',
    name: 'Steel Ball',
    description:
      'A heavy lit steel ball, for something that rolls along the floor and comes back.',
    dataUrl: image('pinball'),
  },
  {
    id: 'bat',
    name: 'Bat',
    description:
      'Wings spread and seen head-on, for something that flies at you in flaps — head-on rather than in profile because it turns round every time it flaps.',
    dataUrl: image('bat'),
  },
  {
    id: 'spring',
    name: 'Spring',
    description:
      'A side-on coil, symmetric top to bottom, for something that bounces between a floor and a ceiling and reads the same at either end.',
    dataUrl: image('spring'),
  },
  {
    id: 'shuriken',
    name: 'Shuriken',
    description:
      'Four blades on the diagonals, for something that spins and comes off a wall at the angle it arrived — the diagonals so that a spin reads as one at any frame.',
    dataUrl: image('shuriken'),
  },
  {
    id: 'eyeball',
    name: 'Eyeball',
    description:
      'Small and pale and looking at you, for the one thing in a room that a wall does not stop.',
    dataUrl: image('eyeball'),
  },
  {
    id: 'blob',
    name: 'Blob',
    description:
      'A shape with no front, for something that wanders: everything else tells you where it is going and this one cannot.',
    dataUrl: image('blob'),
  },
  {
    id: 'rocket',
    name: 'Rocket',
    description:
      'A finned rocket pointing RIGHT, which is where a heading of zero points — for something that takes the next turning every time it stops.',
    dataUrl: image('rocket'),
  },
  {
    id: 'doorOpen',
    name: 'Open Door',
    description:
      'The same frame with the slab swung back and the room’s dark showing through — what a Door looks like once something has unlocked it.',
    dataUrl: image('doorOpen'),
  },
  {
    id: 'gem',
    name: 'Gem',
    description:
      'A green cut stone with a bright table, for the thing a level is about having all of. Told from a Coin by shape and color both.',
    dataUrl: image('gem'),
  },
  {
    id: 'conveyor',
    name: 'Conveyor Belt',
    description:
      'A belt on rollers with chevrons pointing the way it runs, for a floor that carries you along.',
    dataUrl: image('conveyor'),
  },
  {
    id: 'ice',
    name: 'Ice',
    description:
      'A pale blue floor with a lit top edge, for ground you cannot stop or turn on.',
    dataUrl: image('ice'),
  },
  {
    id: 'sludge',
    name: 'Sludge',
    description:
      'A thick ochre ooze with a lumpy edge and bubbles in it, for ground that drags. Deliberately unlike grass, which is what ordinary Ground already looks like.',
    dataUrl: image('sludge'),
  },
  {
    id: 'pilot',
    name: 'Pilot',
    description:
      'The player with a jetpack on: a tank either side, so the pack is visible from the front.',
    dataUrl: image('pilot'),
  },
  {
    id: 'ladder',
    name: 'Ladder',
    description:
      'A rung of ladder, drawn to stack: a column of these is one ladder, with the rungs evenly spaced across the joints.',
    dataUrl: image('ladder'),
  },
  {
    id: 'hill',
    name: 'Hill',
    description: 'A dim green mound, for scenery a long way behind the floor.',
    dataUrl: image('hill'),
  },
  {
    id: 'pipe',
    name: 'Pipe',
    description: 'One segment of a green pipe, for stacking into a column.',
    dataUrl: image('pipe'),
  },
  {
    id: 'crawler',
    name: 'Crawler',
    description:
      'A purple bug on six legs, for something that patrols and damages.',
    dataUrl: image('crawler'),
  },
  {
    id: 'wall',
    name: 'Wall',
    description:
      'A block of stone that tiles both ways, for rooms and columns.',
    dataUrl: image('wall'),
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
  {
    id: 'pilotFly',
    name: 'Pilot Flying',
    description: 'Four frames of the pilot with both jets lit, side by side.',
    dataUrl: image('pilotFly'),
    sheet: SQUARE_CELLS,
  },
  {
    id: 'pilotClimb',
    name: 'Pilot Climbing',
    description: 'Four frames of the pilot reaching up a ladder, side by side.',
    dataUrl: image('pilotClimb'),
    sheet: SQUARE_CELLS,
  },
  {
    id: 'shipThrust',
    name: 'Ship Thrusting',
    description: 'Four frames of the ship with its engine lit, side by side.',
    dataUrl: image('shipThrust'),
    sheet: SQUARE_CELLS,
  },
  {
    id: 'asteroidSpin',
    name: 'Asteroid Tumbling',
    description: 'Eight frames of a rock turning end over end, side by side.',
    dataUrl: image('asteroidSpin'),
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
    id: 'pilotFly',
    name: 'Pilot Flying',
    description: 'A jetpack burning, for while it is switched on.',
    sprites: ['pilotFly'],
    document: {
      type: 'animation',
      animations: {pilotFly: strip('pilotFly', 4, 16)},
    },
  },
  {
    id: 'pilotClimb',
    name: 'Pilot Climbing',
    description: 'Hand over hand up a ladder, for while a climb lasts.',
    sprites: ['pilotClimb'],
    document: {
      type: 'animation',
      animations: {pilotClimb: strip('pilotClimb', 4, 8)},
    },
  },
  {
    id: 'shipThrust',
    name: 'Ship Thrust',
    description:
      'A ship with its engine burning, for while the throttle is on.',
    sprites: ['shipThrust'],
    document: {
      type: 'animation',
      animations: {shipThrust: strip('shipThrust', 4, 12)},
    },
  },
  {
    id: 'asteroidSpin',
    name: 'Asteroid Tumble',
    description: 'A rock turning end over end, over and over.',
    sprites: ['asteroidSpin'],
    document: {
      type: 'animation',
      animations: {asteroidSpin: strip('asteroidSpin', 8, 10)},
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

/**
 * A stock backdrop: a shelf entry with no bytes on it.
 *
 * The one part of the library that is not in the bundle. A backdrop is 60KB of
 * someone else's art rather than a 32-pixel drawing this repo generates, so the
 * bytes are fetched by `yarn setup:world` and served (BACKGROUNDS.md §7); what
 * is committed is the list, and `url` is where to go for the rest.
 */
export interface StockBackground {
  /** File stem this is imported as — `cave` becomes `backgrounds/cave.png`. */
  id: string;
  /** What it is, for the picker. */
  name: string;
  /** Where the bytes are, resolved against the configured background base. */
  url: string;
}

/** The file name a stock backdrop is imported under — what a block stores. */
export const backgroundFileName = (id: string): string => `${id}.png`;

/**
 * A label for a backdrop, from its id: `sunAndRainbow` → "Sun and rainbow".
 *
 * Derived rather than authored. Twenty-nine hand-written labels would be
 * twenty-nine chances for the shelf and the file to drift apart, for a picker
 * whose tiles are pictures — a backdrop is a thing you recognise on sight, and
 * the label is what a screen reader reads and what a search would match.
 */
export function backgroundLabel(id: string): string {
  const words = id.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The backdrop shelf.
 *
 * A function, not a constant: the base URL is host-supplied and may be set
 * after this module loads, so resolving it once at import time would bake in
 * whatever the default happened to be.
 */
export function stockBackgrounds(): readonly StockBackground[] {
  const base = getBackgroundBaseUrl();
  return STOCK_BACKGROUND_IDS.map(id => ({
    id,
    name: backgroundLabel(id),
    url: `${base}${backgroundFileName(id)}`,
  }));
}

/** Look a stock backdrop up by its id. */
export function stockBackground(id: string): StockBackground | undefined {
  return stockBackgrounds().find(background => background.id === id);
}
