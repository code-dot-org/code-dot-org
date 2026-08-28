import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef} from 'react';

import {authoringApi} from './api';
import {getLastSeenVersion, subscribeToAuthoringEvents} from './events';

const STATE_KEY = ['authoring', 'state'];
const CHAT_KEY = ['authoring', 'chat'];
const WRITEBACK_KEY = ['authoring', 'writeback', 'plan'];
const widgetKey = (widgetId: string) => ['authoring', 'widget', widgetId];

// A generation turn is many small ops in a row; coalesce the resulting burst
// of 'state' events into one refetch instead of one per op.
const STATE_INVALIDATE_DEBOUNCE_MS = 200;

/**
 * Live curriculum state. SSE events invalidate the query, so structural
 * generation becomes visible incrementally without a manual rebuild.
 */
export function useAuthoringState() {
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const invalidateStateDebounced = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        queryClient.invalidateQueries({queryKey: STATE_KEY});
        // A 'state' event also covers levelProperties changes (e.g. an
        // agent/author instructions edit, or update_level's Maze grid
        // patch) — those live in their own per-level query, so refresh the
        // whole family rather than tracking which numericId changed.
        queryClient.invalidateQueries({
          queryKey: ['authoring', 'levelProperties'],
        });
        // Same reasoning: the write-back plan is a pure function of the
        // change log, so any curriculum edit can change what it would write.
        queryClient.invalidateQueries({queryKey: WRITEBACK_KEY});
      }, STATE_INVALIDATE_DEBOUNCE_MS);
    };

    const unsubscribe = subscribeToAuthoringEvents(event => {
      if (event.type === 'state') {
        invalidateStateDebounced();
      } else if (event.type === 'hello') {
        // Reconnect after a service restart: the curriculum may have moved
        // on without us, and no 'state' event will follow to say so.
        const lastSeen = getLastSeenVersion();
        if (lastSeen !== undefined && lastSeen !== event.version) {
          invalidateStateDebounced();
        }
      } else if (event.type === 'widget') {
        queryClient.invalidateQueries({queryKey: widgetKey(event.widgetId)});
        queryClient.invalidateQueries({queryKey: STATE_KEY});
      } else if (event.type === 'chat') {
        queryClient.invalidateQueries({queryKey: CHAT_KEY});
      }
    });

    return () => {
      clearTimeout(debounceRef.current);
      unsubscribe();
    };
  }, [queryClient]);

  return useQuery({queryKey: STATE_KEY, queryFn: authoringApi.fetchState});
}

/** Widget descriptor + source, reloaded when the agent edits the source. */
export function useWidget(widgetId: string) {
  return useQuery({
    queryKey: widgetKey(widgetId),
    queryFn: () => authoringApi.fetchWidget(widgetId),
  });
}

export function useChatLog() {
  return useQuery({queryKey: CHAT_KEY, queryFn: authoringApi.fetchChatLog});
}

/**
 * The current write-back plan (dry run) — drives the top bar's "Write to
 * dashboard/config" button, both its disabled/enabled state (an empty plan
 * has nothing to write) and the dialog's diff/skip listing. Refetches
 * whenever the change log does (see the 'state' event handling above), so
 * the button's disabled state never lags a curriculum edit.
 */
export function useWritebackPlan() {
  return useQuery({
    queryKey: WRITEBACK_KEY,
    queryFn: authoringApi.fetchWritebackPlan,
  });
}

/**
 * Levelbuilder-shaped properties for one numeric level id, for <Lab>.
 * `numericId` is undefined for experiences with no numeric id (a
 * lazily-attached generic level, a widget, a draft never registered) —
 * `enabled: false` skips the fetch rather than requesting a sentinel id
 * that the server will only 404 on.
 */
export function useLevelProperties(numericId: number | undefined) {
  return useQuery({
    queryKey: ['authoring', 'levelProperties', numericId ?? -1],
    queryFn: () => authoringApi.fetchLevelProperties(numericId as number),
    enabled: numericId !== undefined,
  });
}
