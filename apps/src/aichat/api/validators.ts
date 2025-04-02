import {ResponseValidator} from '@cdo/apps/util/HttpClient';

import {isChatMessage, ServerChatEvent} from '../types';

/**
 * Validates ChatEvents fetched by the user chat history API.
 * Currently, this just checks for an ID, and ensures that chat messages are
 * in the correct format.
 * We may add more validation in the future to minimize the risk of breaking changes.
 */
const chatHistoryValidator: ResponseValidator<ServerChatEvent[]> = bodyJson => {
  if (!Array.isArray(bodyJson)) {
    throw new Error('Expected an array of chat events');
  }

  // Filter out any copy chat events, which were logged historically.
  const events = bodyJson.filter(
    event =>
      (event as {descriptionKey?: unknown}).descriptionKey !== 'COPY_CHAT'
  ) as ServerChatEvent[];

  for (const event of events) {
    if (event.id === undefined) {
      throw fieldError('id');
    }

    if (isChatMessage(event)) {
      for (const field of ['chatMessageText', 'role', 'status'] as const) {
        if (event[field] === undefined) {
          throw fieldError(field);
        }
      }

      // Clear out assets if they were stored an out of date format.
      if (event.assets && Array.isArray(event.assets)) {
        event.assets = event.assets.filter(
          asset => typeof asset === 'object' && asset.filename && asset.source
        );
      }
    }
  }

  return events;
};

function fieldError(fieldName: string) {
  return new Error(`Missing required field: ${fieldName}`);
}

export {chatHistoryValidator};
