// Putting a map's `raises` into the world the map was imported to.
//
// THIS IS THE PRICE THE PLAN SAID IT WOULD PAY. A map declares which of the
// world's events it raises and does NOT declare the events themselves, so a
// stock map dropped into a project that has never heard of `quit` raises
// nothing — until somebody writes `define event ⟨quit⟩` in the world. The
// import writes it, which means the import EDITS A FILE THE LEARNER OWNS
// rather than only adding files beside it (specs/MAP_EVENTS_PLAN.md, "What it
// costs, said plainly").
//
// Two things keep that bearable. It only ever ADDS: an event the world already
// declares is left exactly as it is, signature and all, because the learner's
// version of `a tab is chosen` is the one the project is written against. And
// it appends to the END of `define world`'s chain, so nothing above moves.

import type {BlockParam} from '../actors/stock/workspace';
import {parseWorldOwnMeta} from '../blockly/ownProperties';
import {topBlocksOf, type TopBlock} from '../blockly/topBlocks';
import {MAIN_WORLD_PATH} from '../mainWorld';

/** One event a map raises, with the value it carries if it carries one. */
export interface RaisedEvent {
  /** What it is called — `quit`, `a tab is chosen`. */
  readonly name: string;
  /** Its one parameter, for an event that carries a value. */
  readonly carries?: BlockParam;
}

/** `define event ⟨a tab is chosen ⟨which⟩⟩`, as a world's body holds one. */
const declaration = (event: RaisedEvent) => ({
  type: 'world_rule_event',
  extraState: {
    parts: [
      {kind: 'label', text: event.name},
      ...(event.carries
        ? [
            {
              kind: 'param',
              name: event.carries.name,
              type: event.carries.type,
              var: event.carries.id,
            },
          ]
        : []),
    ],
  },
});

/**
 * The world's file, with a `define event` for every named event it lacks.
 *
 * Returns the contents unchanged when there is nothing to add, when the file
 * will not parse, or when it holds no `define world` — a caller that cannot
 * find the declaration site should leave the file alone rather than guess at
 * one, and the load-time check is what catches the result.
 */
export function declareEvents(
  contents: string,
  events: readonly RaisedEvent[],
): string {
  if (events.length === 0) {
    return contents;
  }
  let parsed: {variables?: Array<{id: string; name: string; type: string}>};
  try {
    parsed = JSON.parse(contents) as typeof parsed;
  } catch {
    return contents; // mid-edit / not JSON
  }
  const root = (topBlocksOf(parsed) as TopBlock[]).find(
    block => block?.type === 'world_world',
  );
  if (!root) {
    return contents;
  }
  // By NAME, through the same reader the palette uses, so "already declared"
  // means exactly what the toolbox means by it.
  const already = new Set(
    parseWorldOwnMeta(MAIN_WORLD_PATH, contents)?.events.map(
      event => event.name,
    ) ?? [],
  );
  const missing = events.filter(event => !already.has(event.name));
  if (missing.length === 0) {
    return contents;
  }
  let tail: TopBlock = root;
  while (tail.next?.block) {
    tail = tail.next.block;
  }
  for (const event of missing) {
    const block = declaration(event) as TopBlock;
    tail.next = {block};
    tail = block;
    // A parameter is a workspace VARIABLE that the declaration names by id
    // (`designedEvent`), so an event carrying one that the file does not list
    // would come back called `value`.
    if (event.carries) {
      const variables = (parsed.variables ??= []);
      if (!variables.some(variable => variable.id === event.carries?.id)) {
        variables.push({
          id: event.carries.id,
          name: event.carries.name,
          type: event.carries.binds,
        });
      }
    }
  }
  return `${JSON.stringify(parsed, null, 2)}\n`;
}
