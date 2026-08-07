// Events raised during a tick are queued, not dispatched immediately, so no
// handler mutates world state while the simulation is still running (DESIGN.md:
// "Events are queued and run after the simulation tick"). The World flushes the
// queue once, after all Steps have run.

import type {Actor} from './Actor';
import type {GameEvent} from './types';
import type {World} from './World';

interface QueuedEvent {
  event: GameEvent;
  /** Absent for a world event — there is nobody it happened to. */
  actor?: Actor;
  detail?: unknown;
}

export class EventQueue {
  private pending: QueuedEvent[] = [];

  enqueue(event: GameEvent, actor: Actor | undefined, detail?: unknown): void {
    this.pending.push({event, actor, detail});
  }

  size(): number {
    return this.pending.length;
  }

  /**
   * Dispatch every queued event to whatever elected to handle it — the actor
   * it happened to, or the world when it happened to nobody in particular. The
   * queue is snapshotted and cleared first, so an event a handler raises lands
   * in the now-empty queue and is dispatched on the next tick — bounding a tick
   * to one round of handlers and avoiding an in-tick feedback loop.
   */
  flush(world: World): void {
    const batch = this.pending;
    this.pending = [];
    for (const {event, actor, detail} of batch) {
      if (!actor) {
        // A world event: the world holds the handlers, and there is no subject
        // to pass. One dispatch, however many actors are in the world.
        for (const handler of world.handlersFor(event)) {
          handler(world, detail);
        }
        continue;
      }
      for (const handler of actor.handlersFor(event)) {
        handler(world, actor, detail);
      }
    }
  }
}
