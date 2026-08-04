// An actor value is one actor or several (specs/ACTOR_LISTS.md).
//
// The language has ONE actor type: `this actor` is one, `any ⟨Coin⟩` is every
// coin, and a variable holds whichever it was given. A second type would be a
// second colour of variable, a second getter to find, and a wall of sockets
// rejecting each other for reasons a learner has to learn before building
// anything — so instead there is one type and a rule about what an operation
// means when the value holds several:
//
//   - a STATEMENT broadcasts: `set position of ⟨any Coin⟩` sets every coin;
//   - a VALUE reads the first: `x position of ⟨any Coin⟩` has to answer with a
//     number, so it answers with one coin's.
//
// These two functions are that rule, and they are the whole of it. The engine
// itself never learns about lists: every method still takes an `Actor`, the
// subject a handler is called with is still an `Actor`, and it is generated
// code that routes through here (blockly/domainBlocks).

import type {Actor} from './Actor';

/** One actor, or several. What every actor-typed socket carries. */
export type ActorValue = Actor | readonly Actor[];

/**
 * Run `body` for each actor in `value` — the broadcast a statement does.
 *
 * An empty value runs nothing, which is what a loop over nothing does.
 */
export function each(value: ActorValue, body: (actor: Actor) => void): void {
  if (Array.isArray(value)) {
    for (const actor of value) {
      body(actor);
    }
    return;
  }
  body(value as Actor);
}

/**
 * The actor a value reads as — the first, when it holds several.
 *
 * Typed as an `Actor` rather than `Actor | undefined` because that is what a
 * generated expression does with it (`one(x).get(…)`), and because an empty
 * value read as a single actor is a mistake worth failing on rather than
 * quietly answering zero for. It fails the way a deleted actor does.
 */
export function one(value: ActorValue): Actor {
  return Array.isArray(value) ? value[0] : (value as Actor);
}
