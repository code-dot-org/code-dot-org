// Watching a property change, for the questions that can only change answer
// when a particular value does.
//
// The alternative is a step that checks every actor every frame and remembers
// what it saw last time. That is the right shape when the answer depends on
// several things at once, or on time, and the wrong shape when it depends on
// one value: the loop runs in every world including the ones that never ask,
// and the remembering is a slot on every actor that exists only because the
// loop cannot see what it missed.
//
// A watcher sees the change itself — before and after — so it needs to remember
// nothing, and runs exactly as often as the value moves. "Has this actor left
// the map" is the case that motivated it (rules/spatial).
//
// Watchers run INSIDE `Actor.set`, synchronously, with the new value already
// stored. So one may read the actor freely; what it must not do is write the
// property it is watching, which would recurse. Raising an event is the
// intended use, and events are queued rather than dispatched (core/EventQueue),
// so a handler still runs after the tick like every other.

import type {Property, PropertyWatcher} from './types';

/**
 * Call `watcher` whenever `property` is set on any actor.
 *
 * Registered against the property itself, so it applies to every actor that
 * has one — this is not a subscription per actor, and there is nothing to
 * unsubscribe. Rules register theirs as they are declared, at module load.
 */
export function watchProperty<T>(
  property: Property<T>,
  watcher: PropertyWatcher<T>,
): void {
  const list = property.watch;
  if (list) {
    list.push(watcher as PropertyWatcher);
  } else {
    property.watch = [watcher as PropertyWatcher];
  }
}
