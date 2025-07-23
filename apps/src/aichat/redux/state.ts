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
} from '../types';

export interface AichatState {
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
}
