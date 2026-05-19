import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {RESET_CONVERSATION_CUSTOMIZATION_UPDATES} from '../constants';
import {
  AiChatClientType,
  ChatAsset,
  ChatEvent,
  ChatMessage,
  CompletedChatMessage,
  FeedbackValue,
  isCompletedChatMessage,
  isModelUpdate,
  isNotification,
  isPendingOrCompletedChatMessage,
  isUserActionEvent,
  ServerChatEvent,
  UserAddedSelectionContextItem,
  WorkspaceTeacherViewTab,
  UploadStatus,
} from '../types';

import {AichatState} from './state';

const initialState: AichatState = {
  clientType: undefined,
  chatEventsPast: [],
  chatEventsCurrent: [],
  studentChatHistory: [],
  stagedFiles: [],
  stagedFilesAlert: undefined,
  chatWorkspaceSelectedTab: null,
  userAddedSelectionContext: {},
};

const aichatSlice = createSlice({
  name: 'aichat',
  initialState,
  reducers: {
    addEventToChatEventsCurrent: (state, action: PayloadAction<ChatEvent>) => {
      state.chatEventsCurrent.push(action.payload);
    },
    setStudentChatHistory: (
      state,
      action: PayloadAction<ServerChatEvent[]>
    ) => {
      state.studentChatHistory = action.payload;
    },
    setOwnChatHistory: (state, action: PayloadAction<ServerChatEvent[]>) => {
      // It's confusing / not helpful for users to see their own history of when they loaded the level.
      // These events are exclusively for teachers to view their student's activity, so we exclude them
      // when someone is looking at their own history.
      const events = action.payload.filter(
        event =>
          !(isUserActionEvent(event) && event.descriptionKey === 'LOAD_LEVEL')
      );

      // Find the last index of an event that marks the start a new conversation with the model.
      let lastResetIndex = -1;
      for (let i = events.length - 1; i >= 0; i--) {
        const event = events[i];

        // We always reset conversation history when the user clears the chat.
        // In addition, for AI Chat lab, clear the history when certain model updates occur,
        // as the user controls model updates.
        if (
          (state.clientType === AiChatClientTypes.AI_CHAT_LAB &&
            isModelUpdate(event) &&
            RESET_CONVERSATION_CUSTOMIZATION_UPDATES.includes(
              event.updatedField
            )) ||
          (isUserActionEvent(event) && event.descriptionKey === 'CLEAR_CHAT')
        ) {
          lastResetIndex = i;
          break;
        }
      }

      if (lastResetIndex >= 0) {
        state.chatEventsCurrent = events.slice(lastResetIndex);
      } else {
        state.chatEventsCurrent = events;
      }
    },
    setClientType(state, action: PayloadAction<AiChatClientType>) {
      state.clientType = action.payload;
    },
    removeUpdateMessage: (state, action: PayloadAction<number>) => {
      const modelUpdateMessageInfo = getUpdateMessageLocation(
        action.payload,
        state
      );
      if (!modelUpdateMessageInfo) {
        return;
      }

      const {index, messageListKey} = modelUpdateMessageInfo;
      state[messageListKey].splice(index, 1);
    },
    updateChatMessageFeedback: (
      state,
      action: PayloadAction<{id: number; feedback: FeedbackValue | undefined}>
    ) => {
      const messageToUpdate = state.studentChatHistory.find(
        message => message.id === action.payload.id
      );

      if (messageToUpdate && isCompletedChatMessage(messageToUpdate)) {
        messageToUpdate.teacherFeedback = action.payload.feedback;
      }
    },
    clearChatMessages: state => {
      state.chatEventsPast = [];
      state.chatEventsCurrent = [];
    },
    updateChatMessageStatus: (
      state,
      action: PayloadAction<{updateId: string; status: ChatMessage['status']}>
    ) => {
      const event = state.chatEventsCurrent.find(
        (event): event is ChatMessage =>
          isPendingOrCompletedChatMessage(event) &&
          event.updateId === action.payload.updateId
      );
      if (!event) return;
      event.status = action.payload.status;
    },
    updateRequestId: (
      state,
      action: PayloadAction<{updateId: string; requestId: number}>
    ) => {
      const event = state.chatEventsCurrent.find(
        (event): event is ChatMessage =>
          isPendingOrCompletedChatMessage(event) &&
          event.updateId === action.payload.updateId
      );
      if (!event) return;
      (event as CompletedChatMessage).requestId = action.payload.requestId;
    },
    setNewChatSession: state => {
      state.chatEventsPast.push(...state.chatEventsCurrent);
      state.chatEventsCurrent = [];
    },
    addStagedFile(
      state,
      action: PayloadAction<{
        key: string;
        asset: ChatAsset;
        loaded?: boolean;
        timestamp?: string;
      }>
    ) {
      state.stagedFiles.push({
        ...action.payload,
        status: action.payload.loaded ? 'uploaded' : 'uploading',
      });
    },
    stagedFileUploadFinished(
      state,
      action: PayloadAction<{
        key: string;
        status: UploadStatus;
        hideAlert?: boolean;
      }>
    ) {
      const {key, status, hideAlert} = action.payload;
      if (status === 'uploaded') {
        const fileIndex = state.stagedFiles.findIndex(file => file.key === key);
        if (fileIndex !== -1) {
          state.stagedFiles[fileIndex].status = 'uploaded';
        }
      } else {
        // Remove from staged files and set alert (unless hidden)
        state.stagedFiles = state.stagedFiles.filter(file => file.key !== key);
        if (!hideAlert) {
          state.stagedFilesAlert = status;
        }
      }
    },
    stagedFilesLimitExceeded(state) {
      state.stagedFilesAlert = 'fileLimitExceeded';
    },
    clearStagedFilesAlert(state) {
      state.stagedFilesAlert = undefined;
    },
    removeStagedFile(state, action: PayloadAction<string>) {
      state.stagedFiles = state.stagedFiles.filter(
        file => file.key !== action.payload
      );
      state.stagedFilesAlert = undefined;
    },
    clearStagedFiles(state) {
      state.stagedFiles = [];
      state.stagedFilesAlert = undefined;
    },
    setChatWorkspaceSelectedTab(
      state,
      action: PayloadAction<WorkspaceTeacherViewTab | null>
    ) {
      state.chatWorkspaceSelectedTab = action.payload;
    },
    addItemToUserAddedSelectionContext(
      state,
      action: PayloadAction<UserAddedSelectionContextItem>
    ) {
      state.userAddedSelectionContext[action.payload.displayName] =
        action.payload;
    },
    removeItemFromUserAddedSelectionContext(
      state,
      action: PayloadAction<string>
    ) {
      state.userAddedSelectionContext[action.payload] &&
        delete state.userAddedSelectionContext[action.payload];
    },
    clearUserAddedSelectionContext(state) {
      state.userAddedSelectionContext = {};
    },
  },
});

// List keys of chat events to look through when removing a message.
const messageListKeys = ['chatEventsPast', 'chatEventsCurrent'] as const;

const getUpdateMessageLocation = (removeId: number, state: AichatState) => {
  for (const messageListKey of messageListKeys) {
    const messageList = state[messageListKey];

    // Only allow removing individual messages that are model updates and error notifications,
    // as we want to retain user and bot message history
    // when requesting model responses within a chat session.
    // If we want to clear all history
    // and start a new session, see clearChatMessages.
    const itemToRemovePosition = messageList.findIndex(
      message =>
        (isModelUpdate(message) && message.removeId === removeId) ||
        (isNotification(message) && message.removeId === removeId)
    );

    if (itemToRemovePosition >= 0) {
      return {index: itemToRemovePosition, messageListKey};
    }
  }
};

registerReducers({aichat: aichatSlice.reducer});

export const aichatReducer = aichatSlice.reducer;

export const {
  addEventToChatEventsCurrent,
  updateChatMessageStatus,
  updateRequestId,
  updateChatMessageFeedback,
  clearChatMessages,
  removeUpdateMessage,
  setNewChatSession,
  setStudentChatHistory,
  setOwnChatHistory,
  setClientType,
  addStagedFile,
  stagedFileUploadFinished,
  removeStagedFile,
  clearStagedFiles,
  stagedFilesLimitExceeded,
  clearStagedFilesAlert,
  setChatWorkspaceSelectedTab,
  addItemToUserAddedSelectionContext,
  removeItemFromUserAddedSelectionContext,
  clearUserAddedSelectionContext,
} = aichatSlice.actions;
