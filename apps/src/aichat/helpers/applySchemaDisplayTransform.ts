import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {ChatEvent, isChatMessage} from '../types';

/**
 * Applies a level's jsonSchemaResponseCallback to assistant messages at render
 * time.
 *
 * WHY AT RENDER TIME
 *
 * This transform used to run in submitChatContents, rewriting
 * chatMessageText before the event was logged. That made stored chat history a
 * client-side derivation of the model's response rather than the response
 * itself, so nothing on the server could check it against what the model
 * actually produced. The transform is presentational, so it belongs here.
 *
 * MIXED HISTORY
 *
 * Events logged before that change hold already-transformed prose; events
 * logged after hold the raw JSON the model returned. Nothing marks which is
 * which, so we distinguish by trying to parse: raw JSON parses and gets the
 * callback applied, prose does not and is rendered unchanged.
 *
 * This is a heuristic, and it is wrong in one direction: an old transformed
 * message whose text happens to be valid JSON would be passed to the callback.
 * Prose is not valid JSON in practice, and the callback is guarded below, so
 * the failure mode is rendering the original text rather than throwing. This
 * can be removed once no pre-transition events remain.
 */
export function applySchemaDisplayTransform(
  events: ChatEvent[],
  jsonSchemaResponseCallback?: (response: unknown) => string
): ChatEvent[] {
  if (!jsonSchemaResponseCallback) {
    return events;
  }

  let changed = false;
  const transformed = events.map(event => {
    const next = transformEvent(event, jsonSchemaResponseCallback);
    if (next !== event) {
      changed = true;
    }
    return next;
  });

  // Preserve referential identity when nothing changed, so memoized consumers
  // downstream do not re-render on every call.
  return changed ? transformed : events;
}

function transformEvent(
  event: ChatEvent,
  jsonSchemaResponseCallback: (response: unknown) => string
): ChatEvent {
  if (!isChatMessage(event)) {
    return event;
  }
  // Only successful model output is schema-shaped. User messages are the user's
  // own words, and errored assistant messages carry a placeholder, not JSON.
  if (event.role !== Role.ASSISTANT || event.status !== Status.OK) {
    return event;
  }

  const parsed = parseJsonObject(event.chatMessageText);
  if (parsed === undefined) {
    return event;
  }

  try {
    return {...event, chatMessageText: jsonSchemaResponseCallback(parsed)};
  } catch {
    // A callback that cannot handle this payload must not blank the message or
    // crash the transcript; fall back to the stored text.
    return event;
  }
}

/**
 * Returns the parsed value only for JSON objects and arrays. Bare JSON scalars
 * are excluded deliberately: a stored message of "42" or "true" is text that
 * happens to be valid JSON, not a schema response.
 */
function parseJsonObject(text: string): unknown | undefined {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return undefined;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}
