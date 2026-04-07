import {ThreadTypeFields} from '../constants';
import {AiArtifact, ChatItem, ChatPrompt, ChatTextMessage} from '../types';

export interface AiDiffChatState {
  chatIsOpen: boolean;
  // Id of the current thread open
  threadId: number;
  // Title of the current thread open
  threadTitle: string;
  // Type of thread which can be used to delineate initial messages, whether to show
  // suggested prompts, etc.
  threadType: ThreadTypeFields;
  // Specify prompt for a new thread
  initialThreadPrompt: ChatPrompt | null;
  // Selected prompt in the current thread
  selectedPrompt: ChatPrompt | null;
  // Chat history of the current thread
  threadMessages: ChatItem[];
  // This is similar to the threadId but is used slightly differently: changing the
  // threadKeyId resets the component state. If threadKeyId is already 0 (i.e.
  // starting a new thread from a new thread) then we need to alternate to a different
  // key value to reset state (-1 is safe because it won't accidentally match a
  // threadId value).
  threadKeyId: number;
  // The thread's artifact if an artifact has been saved for this thread
  artifact?: AiArtifact;
  // AI TA's opening message for a thread
  initialChatMessage: string;
  // The thread's artifact state- undefined if not in the artifact creation flow,
  // otherwise a string representing the artifact type
  artifactType: string | undefined;
  // If the user is viewing the artifact save screen, this will contain the
  // message they want to create an artifact from. Undefined otherwise.
  pendingArtifactMessage?: ChatTextMessage;
}
