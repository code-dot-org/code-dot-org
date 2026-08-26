import type {ChatMessage} from './api';

/** Events the authoring service pushes over SSE. */
export type AuthoringServerEvent =
  | {type: 'hello'; version: number}
  | {type: 'state'; version: number}
  | {type: 'widget'; widgetId: string; version: number}
  | {type: 'chat'; message: ChatMessage}
  | {
      type: 'agent-status';
      turnId: string;
      status: 'started' | 'tool' | 'text' | 'done' | 'error';
      detail?: string;
    };

type Listener = (event: AuthoringServerEvent) => void;

// One EventSource per page. Listeners come and go with React effects; the
// connection itself lives for the session so background generation keeps
// streaming while the author navigates between lessons.
let source: EventSource | undefined;
const listeners = new Set<Listener>();

// Curriculum version last observed over the wire (from a 'state' event), so a
// 'hello' on reconnect can tell whether the service moved on without us.
let lastSeenVersion: number | undefined;

/** Last curriculum version observed over the wire. */
export function getLastSeenVersion(): number | undefined {
  return lastSeenVersion;
}

// Recent activity feed for the sidebar, kept outside React so events arriving
// while no feed component is mounted aren't lost. Bounded to stay small.
const FEED_LIMIT = 200;
let feed: AuthoringServerEvent[] = [];
let feedVersion = 0;
const feedSubscribers = new Set<() => void>();

function dispatch(event: AuthoringServerEvent): void {
  if (event.type === 'state') {
    lastSeenVersion = event.version;
  }
  if (event.type === 'chat' || event.type === 'agent-status') {
    feed = [...feed.slice(-(FEED_LIMIT - 1)), event];
    feedVersion += 1;
    for (const notify of feedSubscribers) {
      notify();
    }
  }
  for (const listener of listeners) {
    listener(event);
  }
}

function ensureConnected(): void {
  if (source) {
    return;
  }
  source = new EventSource('/authoring-api/events');
  source.onmessage = raw => {
    try {
      dispatch(JSON.parse(raw.data) as AuthoringServerEvent);
    } catch {
      // Malformed frame: ignore rather than tearing down the stream.
    }
  };
  // EventSource reconnects on its own; nothing to do on error.
}

/** Subscribe to live authoring events. Connects lazily on first subscriber. */
export function subscribeToAuthoringEvents(listener: Listener): () => void {
  ensureConnected();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** useSyncExternalStore bindings for the bounded activity feed. */
export const activityFeedStore = {
  subscribe(notify: () => void): () => void {
    ensureConnected();
    feedSubscribers.add(notify);
    return () => {
      feedSubscribers.delete(notify);
    };
  },
  getSnapshot(): AuthoringServerEvent[] {
    return feed;
  },
  getVersion(): number {
    return feedVersion;
  },
};
