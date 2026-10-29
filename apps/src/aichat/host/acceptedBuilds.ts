import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import {
  AI_TUTOR_VERSION_ACTION_ACCEPT,
  ChatEvent,
  isChatMessage,
  isNotification,
} from '../types';

import {AcceptedBuild} from './ChatHostContext';

/**
 * Produces a list of accepted builds from chat events; each carries the files
 * the AI changed, and the series of chat messages that produced it.
 */
export function acceptedBuilds(events: ChatEvent[]): AcceptedBuild[] {
  const builds: AcceptedBuild[] = [];
  let lines: string[] = [];
  for (const event of events) {
    if (isChatMessage(event)) {
      const who = event.role === Role.USER ? 'Student' : 'Tutor';
      lines.push(
        `${who}: ${event.chatMessageDisplayText ?? event.chatMessageText}`
      );
    } else if (
      isNotification(event) &&
      event.notificationType === AI_TUTOR_VERSION_ACTION_ACCEPT
    ) {
      builds.push({
        at: event.timestamp,
        files: event.files ?? [],
        transcript: lines.join('\n'),
      });
      lines = [];
    }
  }
  return builds;
}
