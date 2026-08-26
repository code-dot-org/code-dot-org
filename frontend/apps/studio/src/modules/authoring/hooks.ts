import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';

import {authoringApi} from './api';
import {subscribeToAuthoringEvents} from './events';

const STATE_KEY = ['authoring', 'state'];
const CHAT_KEY = ['authoring', 'chat'];
const widgetKey = (widgetId: string) => ['authoring', 'widget', widgetId];

/**
 * Live curriculum state. SSE events invalidate the query, so structural
 * generation becomes visible incrementally without a manual rebuild.
 */
export function useAuthoringState() {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      subscribeToAuthoringEvents(event => {
        if (event.type === 'state') {
          queryClient.invalidateQueries({queryKey: STATE_KEY});
        } else if (event.type === 'widget') {
          queryClient.invalidateQueries({queryKey: widgetKey(event.widgetId)});
          queryClient.invalidateQueries({queryKey: STATE_KEY});
        } else if (event.type === 'chat') {
          queryClient.invalidateQueries({queryKey: CHAT_KEY});
        }
      }),
    [queryClient],
  );

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
