// Putting a map's `raises` on the Main Screen of the game it was imported to.
//
// THIS IS THE PRICE THE PLAN SAID IT WOULD PAY. A map declares which of the
// game's events it raises and does NOT declare the events themselves, so a
// stock map dropped into a project that has never heard of `quit` raises
// nothing — until the Main Screen declares `quit`. The import declares it,
// which means the import EDITS A FILE THE LEARNER OWNS rather than only adding
// files beside it (specs/MAP_EVENTS_PLAN.md, "What it costs, said plainly").
//
// It only ever ADDS: an event the screen already declares is left exactly as
// it is, signature and all, because the learner's version of `a tab is
// chosen` is the one the project is written against.

import type {BlockParam} from '../actors/stock/workspace';
import type {ScreenEvent} from '../blockly/screenData';

/** One event a map raises, with the value it carries if it carries one. */
export interface RaisedEvent {
  /** What it is called — `quit`, `a tab is chosen`. */
  readonly name: string;
  /** Its one parameter, for an event that carries a value. */
  readonly carries?: BlockParam;
}

/**
 * The Main Screen's file, with every named event it lacks in its `events`
 * (specs/SCREEN_MAP_PLAN.md, step 4). Only ever adds; the contents unchanged when there is nothing
 * to add or the file will not parse.
 */
export function declareScreenEvents(
  contents: string,
  events: readonly RaisedEvent[],
): string {
  let parsed: {events?: ScreenEvent[]};
  try {
    parsed = JSON.parse(contents) as typeof parsed;
  } catch {
    return contents;
  }
  if (!parsed || typeof parsed !== 'object') {
    return contents;
  }
  const held = Array.isArray(parsed.events) ? parsed.events : [];
  const already = new Set(held.map(event => event?.name));
  const missing = events.filter(event => !already.has(event.name));
  if (missing.length === 0) {
    return contents;
  }
  parsed.events = [
    ...held,
    ...missing.map(event => ({
      name: event.name,
      ...(event.carries ? {carries: event.carries} : {}),
    })),
  ];
  return `${JSON.stringify(parsed, null, 2)}\n`;
}
