import {ThreadTypeFields} from '@cdo/apps/aiDifferentiation/constants';
import {ChatItem, ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

import {ModalTypes} from '../constants';
import {
  AiCustomizations,
  ChatAsset,
  ChatEvent,
  FieldVisibilities,
  PendingChatMessage,
  SaveError,
  SaveType,
  ServerChatEvent,
  ViewMode,
  AiChatClientType,
  WorkspaceTeacherViewTab,
  UserAddedSelectionContext,
} from '../types';

export interface AichatState {
  chatIsOpen: boolean;
  clientType?: AiChatClientType;
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
  // AI TA's opening message for a thread
  initialChatMessage: string;
  // Content from previous chat sessions that we track purely for visibility to the user
  // and do not send to the model as history.
  chatEventsPast: ChatEvent[];
  // Items in the current chat session that we want to provide as history to the model.
  chatEventsCurrent: ChatEvent[];
  // The user message currently awaiting response from the model (if any).
  chatMessagePending?: PendingChatMessage;
  // Student events viewed by a teacher user in chat workspace. Always fetched from the server.
  studentChatHistory: ServerChatEvent[];
  // Denotes whether we should show the warning or teacher onboarding modal
  showModalType: ModalTypes | undefined;
  initialAiCustomizations: AiCustomizations;
  currentAiCustomizations: AiCustomizations;
  savedAiCustomizations: AiCustomizations;
  fieldVisibilities: FieldVisibilities;
  viewMode: ViewMode;
  // If a save is currently in progress
  saveInProgress: boolean;
  // The type of save action being performed (customization update, publish, model card save, etc).
  currentSaveType: SaveType | undefined;
  userHasAichatAccess: boolean;
  // List of files that have been staged for upload to the model.
  stagedFiles: {
    key: string;
    asset: ChatAsset;
    status: 'uploading' | 'uploaded';
  }[];
  // Alert to display for staged files if something went wrong.
  stagedFilesAlert:
    | 'uploadFailed'
    | 'fileLimitExceeded'
    | 'sizeLimitExceeded'
    | undefined;
  // If the user has a sent a message on this level
  hasSentMessage: boolean;
  // If starting customizations have been set on this level
  hasSetStartingCustomizations: boolean;
  // If the user has updated customizations on this level
  hasUpdatedCustomizations: boolean;
  // Error message to display if a save fails
  saveError: SaveError | undefined;
  // If the model customizations were just reset to the default level values.
  showResetMessage: boolean;
  // The tab selected when a teacher is viewing a student's chat history.
  chatWorkspaceSelectedTab: WorkspaceTeacherViewTab | null;
  userAddedSelectionContext: UserAddedSelectionContext;
  // The thread's artifact state- undefined if not in the artifact creation flow,
  // otherwise a string representing the artifact type
  artifactType: string | undefined;
}
