// Events raised during a tick are queued, not dispatched immediately, so no
// handler mutates world state while the simulation is still running (DESIGN.md:
// "Events are queued and run after the simulation tick"). The World flushes the
// queue once, after all Steps have run.

import type {Actor} from './Actor';
import type {GameEvent} from './types';
import type {World} from './World';

interface QueuedEvent {
  event: GameEvent;
  actor: Actor;
  detail?: unknown;
}

export class EventQueue {
  private pending: QueuedEvent[] = [];

  enqueue(event: GameEvent, actor: Actor, detail?: unknown): void {
    this.pending.push({event, actor, detail});
  }

  size(): number {
    return this.pending.length;
  }

  /**
   * Dispatch every queued event to the actors that elected to handle it. The
   * queue is snapshotted and cleared first, so an event a handler raises lands
   * in the now-empty queue and is dispatched on the next tick — bounding a tick
   * to one round of handlers and avoiding an in-tick feedback loop.
   */
  flush(world: World): void {
    const batch = this.pending;
    this.pending = [];
    for (const {event, actor, detail} of batch) {
      for (const handler of actor.handlersFor(event)) {
        handler(world, actor, detail);
      }
    }
  }
}
