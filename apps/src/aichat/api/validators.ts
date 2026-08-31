import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
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

      // Chat events are stored as JSON blobs exactly as the client posted
      // them, so an event written by an older or buggy client can hold any
      // shape. Every consumer of the message text needs a string: markdown
      // rendering, clipboard copy, the history sent to the model, and the
      // markdownToTxt() calls behind the live region and text-to-speech.
      // markdownToTxt() (marked) throws outright on a non-string, and it is
      // called from an effect, so one bad event would otherwise fail the whole
      // level rather than just one message. Coerce here, where history enters
      // the app, and report it so bad writers can be tracked down.
      const textFields = ['chatMessageText', 'chatMessageDisplayText'] as const;
      for (const field of textFields) {
        const value: unknown = event[field];
        if (value !== undefined && typeof value !== 'string') {
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logWarning(
              `Chat event ${event.id}: ${field} is of type ` +
                `${Object.prototype.toString.call(value)}, string expected. ` +
                'Coercing to a string.'
            );
          event[field] = JSON.stringify(value);
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
