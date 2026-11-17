import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

import {ChatEvent, isChatMessage} from '../types';

import {ChatTranscript} from './ChatHostContext';

/**
 * The whole conversation so far, dated by the newest reply the tutor
 * finished, or undefined before the first reply.
 */
export function chatTranscript(
  events: ChatEvent[]
): ChatTranscript | undefined {
  const lines: string[] = [];
  let replies = 0;
  let at: number | undefined;
  for (const event of events) {
    if (!isChatMessage(event)) continue;
    const who = event.role === Role.USER ? 'Student' : 'Tutor';
    lines.push(
      `${who}: ${event.chatMessageDisplayText ?? event.chatMessageText}`
    );
    if (
      event.role === Role.ASSISTANT &&
      event.status === AiInteractionStatus.OK
    ) {
      replies++;
      at = event.timestamp;
    }
  }
  return at === undefined ? undefined : {at, replies, text: lines.join('\n')};
}
