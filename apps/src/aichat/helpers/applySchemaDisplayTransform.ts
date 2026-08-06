import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {ChatEvent, isChatMessage} from '../types';

/**
 * Renders a schema lab's stored assistant messages for display. Stored
 * messages hold the model's response as the model produced it; the lab's
 * formatForDisplay turns that into the text a reader sees.
 *
 * Two representations are in play, and nothing in the message distinguishes
 * them: the raw JSON the model returned, and prose. So the choice is made by
 * attempting a parse -- objects and arrays get formatted, anything else is
 * rendered unchanged.
 *
 * The prose case exists because these messages once had the callback applied
 * before they were saved. It cannot be dropped until no such rows remain, and
 * aichat_events has no retention policy, so that needs either a backfill or a
 * deliberate cutoff date. Until then this stays.
 */
export function applySchemaDisplayTransform(
  events: ChatEvent[],
  formatForDisplay?: (response: unknown) => string
): ChatEvent[] {
  if (!formatForDisplay) {
    return events;
  }

  let changed = false;
  const transformed = events.map(event => {
    const next = transformEvent(event, formatForDisplay);
    if (next !== event) {
      changed = true;
    }
    return next;
  });

  // Preserve referential identity when nothing changed, so memoized consumers
  // do not re-render on every call.
  return changed ? transformed : events;
}

function transformEvent(
  event: ChatEvent,
  formatForDisplay: (response: unknown) => string
): ChatEvent {
  if (!isChatMessage(event)) {
    return event;
  }
  // Only successful model output is schema-shaped: user messages are the user's
  // own words, and errored assistant messages carry a placeholder, not JSON.
  if (event.role !== Role.ASSISTANT || event.status !== Status.OK) {
    return event;
  }

  const parsed = parseJsonObject(event.chatMessageText);
  if (parsed === undefined) {
    return event;
  }

  try {
    return {...event, chatMessageText: formatForDisplay(parsed)};
  } catch {
    // A callback that cannot handle this payload must not blank the message or
    // crash the transcript.
    return event;
  }
}

/**
 * Returns the parsed value only for JSON objects and arrays. Bare JSON scalars
 * are excluded deliberately: a stored message of "42" or "true" is text that
 * happens to be valid JSON, not a schema response.
 */
export function parseJsonObject(text: string): unknown | undefined {
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
