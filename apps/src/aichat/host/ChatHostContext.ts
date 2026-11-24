// How a chat and whatever mounts it talk without sharing state: the host
// provides this context, the chat hands back a handle once it is up, and
// each side keeps its own state behind that handle.

import {createContext, useContext} from 'react';

import {ProjectFile} from '@cdo/apps/lab2/types';

import {Notification} from '../types';

/** One build the student accepted from the tutor. */
export interface AcceptedBuild {
  /** When the student accepted it, in epoch milliseconds. */
  at: number;
  /** The files the AI changed or added, as accepted. */
  files: ProjectFile[];
  /** What the student and the tutor said since the previous build, one line each. */
  transcript: string;
}

/** The conversation so far, as of the newest reply the tutor finished. */
export interface ChatTranscript {
  /** When that reply arrived, in epoch milliseconds. */
  at: number;
  /** Replies the tutor has finished, that one included. */
  replies: number;
  /** Everything the student and the tutor have said, one line each. */
  text: string;
}

/** A notification as a host may post it; the chat sets its id and time. */
export type HostNotification = Pick<
  Notification,
  'text' | 'includeInChatHistory' | 'hideTimestamp'
> & {
  notificationType: 'hostMessage' | 'info' | 'success' | 'warning' | 'error';
};

/** Actions the chat host may take once the chat is ready. */
export interface ChatHandle {
  /** Shows a notification. Returns a callback to dismiss it. */
  post(notification: HostNotification): () => void;
  /** Calls `listener` for each build the student accepts from now on. Returns a callback to unsubscribe. */
  onBuildAccepted(listener: (build: AcceptedBuild) => void): () => void;
  /** Calls `listener` with the transcript each time the tutor finishes a reply from now on. Returns a callback to unsubscribe. */
  onReply(listener: (transcript: ChatTranscript) => void): () => void;
  /** Disables the student from sending messages. */
  disableSend(): void;
  /** Enables the student to send messages. */
  enableSend(): void;
}

/** What a chat's host supplies. */
export interface ChatHost {
  /** Called with the chat's handle once it mounts, and again if it remounts. */
  onChatReady: (chat: ChatHandle) => void;
  /** Added to analytics events that include project properties, while the chat is mounted. */
  analyticsProperties?: Record<string, string>;
}

export const ChatHostContext = createContext<ChatHost | null>(null);

export const useChatHost = () => useContext(ChatHostContext);
