// The builds a student accepted from the tutor, read off the chat. Each
// accept notification carries the files the AI changed, and the messages
// since the previous accept are the exchange that produced it.

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import {
  AI_TUTOR_VERSION_ACTION_ACCEPT,
  ChatEvent,
  isChatMessage,
  isNotification,
} from '../types';

import {AcceptedBuild} from './ChatHostContext';

/** Every accepted build in the chat, oldest first. */
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
