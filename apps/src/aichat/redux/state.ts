import {
  AiChatClientType,
  ChatAsset,
  ChatEvent,
  ServerChatEvent,
  WorkspaceTeacherViewTab,
  UserAddedSelectionContext,
} from '../types';

export interface AichatState {
  clientType?: AiChatClientType;
  // Content from previous chat sessions that we track purely for visibility to the user
  // and do not send to the model as history.
  chatEventsPast: ChatEvent[];
  // Items in the current chat session that we want to provide as history to the model.
  chatEventsCurrent: ChatEvent[];
  // Student events viewed by a teacher user in chat workspace. Always fetched from the server.
  studentChatHistory: ServerChatEvent[];
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
    | 'imageFileFlagged'
    | undefined;
  // The tab selected when a teacher is viewing a student's chat history.
  chatWorkspaceSelectedTab: WorkspaceTeacherViewTab | null;
  userAddedSelectionContext: UserAddedSelectionContext;
}
