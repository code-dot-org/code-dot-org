import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef} from 'react';

import {authoringApi} from './api';
import {getLastSeenVersion, subscribeToAuthoringEvents} from './events';

const STATE_KEY = ['authoring', 'state'];
const CHAT_KEY = ['authoring', 'chat'];
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
