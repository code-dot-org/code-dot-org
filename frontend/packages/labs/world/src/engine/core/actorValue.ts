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

/**
 * A list that is walked rather than built (specs/ACTOR_LISTS.md).
 *
 * What `the actors ⟨c⟩ in ⟨…⟩ where ⟨…⟩` hands back. `first actor in ⟨…⟩` pulls
 * ONE item and stops, which is the short-circuit the deleted
 * `first actor … where` promised and which an array would have thrown away.
 *
 * Two properties, and both are load-bearing:
 *
 *   - The SOURCE is already read. `filtered` materialises it before this exists
 *     (`world.actors` iterates the live actor list), so a body that spawns
 *     actors while walking one of these terminates.
 *   - It is RE-ITERABLE. `[Symbol.iterator]` builds a fresh walk each time, so
 *     asking twice answers twice — a one-shot generator that read empty the
 *     second time would be a bug nobody could see in the blocks. The predicate
 *     runs again, which is what a test that reads properties costs.
 */
export class LazyActors {
  private readonly walk: () => Iterator<Actor>;

  constructor(walk: () => Iterator<Actor>) {
    this.walk = walk;
  }

  [Symbol.iterator](): Iterator<Actor> {
    return this.walk();
  }
}

/** One actor, several, or a list still being walked. */
export type ActorValue = Actor | readonly Actor[] | LazyActors;

/**
 * The actors in a value, as a list — one actor becomes a list of one.
 *
 * What a `for each` walks. A real `for … of` rather than a callback, because a
 * loop's body may `return` (a query answering early), and a body that returned
 * out of a callback would leave the loop and not the query.
 */
export function all(value: ActorValue): readonly Actor[] {
  if (Array.isArray(value)) {
    return value;
  }
  // Walking it is what materialises it, and this is the one place that does.
  return value instanceof LazyActors ? [...value] : [value as Actor];
}

/**
 * Run `body` for each actor in `value` — the broadcast a statement does.
 *
 * An empty value runs nothing, which is what a loop over nothing does.
 */
export function each(value: ActorValue, body: (actor: Actor) => void): void {
  for (const actor of all(value)) {
    body(actor);
  }
}

/**
 * The first actor `where` accepts — `for each … where` stopped at the match.
 *
 * Takes an iterable rather than an `ActorValue` because it is handed exactly
 * what the loop's `for … of` walks: `world.actors` (a collection) when the
 * source is `all actors`, and `all(…)` otherwise. Both iterate; only one is an
 * array, so anything that needed indexing would have to copy first, and copying
 * the world to look at its first actor is the wrong shape for a search.
 *
 * STOPS at the match, which is the whole difference from the loop. A world with
 * a thousand actors asked for the nearest one still walks a thousand; asked for
 * "a Coin" it walks until it finds one.
 *
 * ANSWERS WITH A LIST — of one actor, or of none. A search that finds nothing
 * is an ordinary outcome, and this is already the language's answer for it: an
 * actor value holds one actor or several (specs/ACTOR_LISTS.md), `empty ⟨var⟩`
 * makes one holding none, and the rule for a value holding none is settled —
 * {@link each} runs nothing, because "a broadcast to nothing should not be an
 * error a learner has to guard". So `remove actor ⟨first actor … where …⟩` with
 * no match removes nothing, quietly and correctly, which is what the block is
 * usually reaching for.
 *
 * Returning the bare actor instead would answer `undefined`, and that would
 * crash the same program on a `TypeError` about a value the learner never
 * named. Reading a PROPERTY off no match still fails — `one([])` is undefined,
 * as {@link one} documents — but that is the case where failing is right, and
 * `how many actors in ⟨…⟩` is the guard for it that already exists.
 */
export function firstWhere(
  actors: Iterable<Actor>,
  where: (actor: Actor) => boolean,
): readonly Actor[] {
  for (const actor of actors) {
    if (where(actor)) {
      return [actor];
    }
  }
  return [];
}

/**
 * `value` with `actor` added — what `push … to ⟨var⟩` assigns back.
 *
 * A value already holding several is appended to IN PLACE, because a set built
 * across a loop is the whole point and two variables naming one list should see
 * each other's pushes. A value holding one actor cannot be appended to, so it
 * becomes a list of two, and the actor that was in it is untouched — which is
 * why this returns the value rather than only mutating it.
 */
export function pushed(
  value: ActorValue | undefined,
  actor: Actor,
): readonly Actor[] {
  if (Array.isArray(value)) {
    (value as Actor[]).push(actor);
    return value;
  }
  // A sequence has nothing to push onto — it is a description of a walk, not a
  // place. So it becomes the actors it describes, plus this one, which is what
  // `add ⟨…⟩ to ⟨a variable holding a filter⟩` can only sensibly mean.
  if (value instanceof LazyActors) {
    return [...all(value), actor];
  }
  return value ? [value as Actor, actor] : [actor];
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
  if (Array.isArray(value)) {
    return value[0];
  }
  if (value instanceof LazyActors) {
    // Pulls ONE and stops — the whole point of the sequence being lazy.
    return value[Symbol.iterator]().next().value as Actor;
  }
  return value as Actor;
}

/**
 * What a list function may be handed.
 *
 * Wider than {@link ActorValue} because the generator hands these exactly what
 * a `for … of` walks: `world.actors` (a collection) when the source is
 * `all actors`, and an actor value otherwise. The same reason {@link firstWhere}
 * takes an `Iterable`.
 */
export type ActorSource = ActorValue | Iterable<Actor>;

/** Walk a source WITHOUT materialising it — what is lazy stays lazy. */
function walk(value: ActorSource): Iterable<Actor> {
  if (value instanceof LazyActors || Array.isArray(value)) {
    return value as Iterable<Actor>;
  }
  // An ActorCollection is iterable; an Actor is not, and is a list of one.
  return typeof (value as Iterable<Actor>)[Symbol.iterator] === 'function'
    ? (value as Iterable<Actor>)
    : [value as Actor];
}

/**
 * The source of a sequence, read NOW.
 *
 * `world.actors` iterates the live actor list, so a sequence that deferred the
 * read would let a body that spawns actors go on finding more of them for ever
 * — the rule this file has had since `ofType` started copying. A source that is
 * ALREADY a sequence is left alone: it snapshotted its own source when it was
 * made, and materialising it here would throw away the laziness that
 * `take ⟨3⟩ of ⟨the actors … where …⟩` exists for.
 */
function held(value: ActorSource): Iterable<Actor> {
  return value instanceof LazyActors ? value : [...walk(value)];
}

/**
 * The actors a test accepts, walked rather than built.
 *
 * `the actors ⟨c⟩ in ⟨…⟩ where ⟨…⟩`. The source is read NOW — `world.actors`
 * iterates the live list, so a loop whose body spawns actors would otherwise
 * not terminate — and the test is applied as the result is walked, so
 * `first actor in ⟨…⟩` stops at the first match and `take ⟨3⟩ of ⟨…⟩` at the
 * third.
 */
export function filtered(
  value: ActorSource,
  where: (actor: Actor) => boolean,
): LazyActors {
  const source = held(value);
  return new LazyActors(function* () {
    for (const actor of source) {
      if (where(actor)) {
        yield actor;
      }
    }
  });
}

/**
 * The actors in `value`, in order of what `key` says about each.
 *
 * STRICT, and it cannot be otherwise: the first item of an ordering is not
 * knowable without seeing all of it. Which is why `extreme` is a block of its
 * own rather than sugar for the first of one of these.
 *
 * Stable, so actors whose keys are equal keep the order they came in — the
 * world's order, which is what everything else here yields. The key is read
 * ONCE per actor rather than on every comparison, because it is an authored
 * expression (`distance from ⟨this⟩ to ⟨c⟩`) and a sort would otherwise
 * evaluate it a few times per item.
 */
export function ordered(
  value: ActorSource,
  key: (actor: Actor) => number,
  descending = false,
): readonly Actor[] {
  const keyed = [...walk(value)].map(actor => ({actor, key: key(actor)}));
  keyed.sort((left, right) =>
    descending ? right.key - left.key : left.key - right.key,
  );
  return keyed.map(entry => entry.actor);
}

/**
 * The first `count` actors, as a sequence — `take ⟨3⟩ of ⟨…⟩`.
 *
 * Lazy, so `take ⟨3⟩ of ⟨the actors … where …⟩` tests until it has three rather
 * than testing everything and then dropping most of it. A count of zero or less
 * is an empty list, which is ordinary here.
 */
export function taken(value: ActorSource, count: number): LazyActors {
  const source = held(value);
  return new LazyActors(function* () {
    if (count <= 0) {
      return;
    }
    let taken = 0;
    for (const actor of source) {
      yield actor;
      if (++taken >= count) {
        return;
      }
    }
  });
}

/**
 * The actor whose `key` is the least (or the greatest) — `the actor ⟨c⟩ in
 * ⟨…⟩ with the ⟨least⟩ ⟨…⟩`.
 *
 * The closest enemy, the biggest asteroid, the oldest bullet: one pass, no
 * allocation, and no ordering built to answer a question about one actor.
 *
 * ANSWERS WITH A LIST of one or of none, for the reason {@link firstWhere}
 * gives: nothing to choose between is an ordinary outcome, and a statement over
 * an empty value does nothing rather than failing.
 *
 * A key that is not a number is skipped rather than compared — `NaN` loses
 * every comparison, so without this an actor whose key failed to compute could
 * be chosen by falling through both branches.
 */
export function extreme(
  value: ActorSource,
  key: (actor: Actor) => number,
  most = false,
): readonly Actor[] {
  let best: Actor | undefined;
  let bestKey = 0;
  for (const actor of walk(value)) {
    const candidate = key(actor);
    if (!Number.isFinite(candidate)) {
      continue;
    }
    if (
      best === undefined ||
      (most ? candidate > bestKey : candidate < bestKey)
    ) {
      best = actor;
      bestKey = candidate;
    }
  }
  return best ? [best] : [];
}

/**
 * The first actor a value holds, as a list of one or of none — `first actor
 * in ⟨…⟩`.
 *
 * The block that makes the language's quietest rule sayable: a value socket
 * already reads the first of several and does not say so, and this is how a
 * program says it on purpose. It answers with a LIST rather than the bare actor
 * so that an empty source is the ordinary "no actors" outcome rather than an
 * `undefined` the learner never named — the same bargain `firstWhere` made.
 */
export function firstOf(value: ActorSource): readonly Actor[] {
  for (const actor of walk(value)) {
    return [actor];
  }
  return [];
}
