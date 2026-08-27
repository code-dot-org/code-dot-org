import type {AuthoringServerEvent} from './events';

type AgentStatusEvent = Extract<AuthoringServerEvent, {type: 'agent-status'}>;

/** turnIds whose most recent status is a terminal one ('done' or 'error'). */
export function computeFinishedTurns(feed: AuthoringServerEvent[]): Set<string> {
  return new Set(
    feed
      .filter(
        (event): event is AgentStatusEvent =>
          event.type === 'agent-status' &&
          (event.status === 'done' || event.status === 'error'),
      )
      .map(event => event.turnId),
  );
}

/** The most recent turn with activity but no terminal status yet — drives
 * the chat sidebar's working indicator and composer gating. */
export function findActiveTurn(
  feed: AuthoringServerEvent[],
): AgentStatusEvent | undefined {
  const finishedTurns = computeFinishedTurns(feed);
  for (let i = feed.length - 1; i >= 0; i--) {
    const event = feed[i];
    if (event.type === 'agent-status' && !finishedTurns.has(event.turnId)) {
      return event;
    }
  }
  return undefined;
}
