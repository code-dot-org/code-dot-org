import {Direction} from './FacingDirection';

export const safeEval = <T>(value: string | undefined, def: T) => value !== undefined ? ((0, eval)('() => ' + value))() as unknown as T : def;

/**
 * Creates a new event.
 */
export function createEvent(
  type: string,
  bubbles: boolean = false,
  cancelable: boolean = false,
): Event {
  return new CustomEvent(type, {
    bubbles,
    cancelable,
  });
}

/**
 * Bisects an array into two arrays based on the given conditional lambda.
 */
export function bisect<T>(
  array: T[],
  conditional: (el: T) => boolean,
): [T[], T[]] {
  return [
    array.filter(x => conditional(x)),
    array.filter(x => !conditional(x)),
  ];
}

/**
 * Returns a random whole integer between the given min and max range.
 *
 * It is inclusive of the min value and exclusive of the max value.
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

const suffixToDirection: {
  Up: number;
  Down: number;
  Left: number;
  Right: number;
} = {
  Up: Direction.North,
  Down: Direction.South,
  Left: Direction.West,
  Right: Direction.East,
};

export function convertNameToEntity(item: string, x: number, y: number): [string, number, number, Direction] | undefined {
  if (
    item.match(
      /^(sheep|zombie|ironGolem|creeper|cod|cow|chicken|dolphin|ghast|boat|salmon|squid|tropicalFish|seaTurtle)(Right|Left|Up|Down|$)/,
    )
  ) {
    const directionMatch = item.match(/(.*)(Right|Left|Up|Down)/);
    const directionToUse = directionMatch
      ? suffixToDirection[directionMatch[2] as keyof typeof suffixToDirection]
      : Direction.East;
    const entityToUse = directionMatch ? directionMatch[1] : item;

    return [entityToUse, x, y, directionToUse];
  }
}
