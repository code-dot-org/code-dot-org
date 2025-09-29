import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

import {
  ModalTypes,
  RESET_CONVERSATION_CUSTOMIZATION_UPDATES,
} from '../constants';
import {
  AiCustomizations,
  ChatEvent,
  LevelAichatSettings,
  ModelCardInfo,
  SaveType,
  ViewMode,
  Visibility,
  isModelUpdate,
  isNotification,
  isUserActionEvent,
  FeedbackValue,
  ServerChatEvent,
  isCompletedChatMessage,
  PendingChatMessage,
  ChatAsset,
  SaveError,
  AiChatClientType,
  WorkspaceTeacherViewTab,
  UserAddedSelectionContextItem,
} from '../types';
import {
  DEFAULT_VISIBILITIES,
  EMPTY_AI_CUSTOMIZATIONS,
} from '../views/modelCustomization/constants';
import {validateModelId} from '../views/modelCustomization/utils';

import {AichatState} from './state';

const initialState: AichatState = {
  clientType: undefined,
  chatEventsPast: [],
  chatEventsCurrent: [],
  chatMessagePending: undefined,
  studentChatHistory: [],
  showModalType: undefined,
  initialAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  currentAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  savedAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  fieldVisibilities: DEFAULT_VISIBILITIES,
  viewMode: ViewMode.EDIT,
  saveInProgress: false,
  currentSaveType: undefined,
  userHasAichatAccess: false,
  stagedFiles: [],
  stagedFilesAlert: undefined,
  hasSentMessage: false,
  hasUpdatedCustomizations: false,
  saveError: undefined,
  showResetMessage: false,
  hasSetStartingCustomizations: false,
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

        if (
          (isModelUpdate(event) &&
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
    setUserHasAichatAccess: (state, action: PayloadAction<boolean>) => {
      state.userHasAichatAccess = action.payload;
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
    setChatMessagePending: (
      state,
      action: PayloadAction<PendingChatMessage>
    ) => {
      state.chatMessagePending = action.payload;
      state.hasSentMessage = true;
    },
    clearChatMessagePending: state => (state.chatMessagePending = undefined),
    setNewChatSession: state => {
      state.chatEventsPast.push(...state.chatEventsCurrent);
      state.chatEventsCurrent = [];
    },
    setShowModalType: (
      state,
      action: PayloadAction<ModalTypes | undefined>
    ) => {
      state.showModalType = action.payload;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setStartingAiCustomizations: (
      state,
      action: PayloadAction<{
        levelAichatSettings?: LevelAichatSettings;
        studentAiCustomizations: AiCustomizations;
      }>
    ) => {
      const {levelAichatSettings, studentAiCustomizations} = action.payload;

      let reconciledAiCustomizations: AiCustomizations = {
        ...(levelAichatSettings?.initialCustomizations ||
          EMPTY_AI_CUSTOMIZATIONS),
      };

      for (const customizationUntyped in reconciledAiCustomizations) {
        const customization = customizationUntyped as keyof AiCustomizations;

        if (
          (levelAichatSettings?.visibilities || DEFAULT_VISIBILITIES)[
            customization
          ] === Visibility.EDITABLE &&
          studentAiCustomizations[customization]
        ) {
          reconciledAiCustomizations = {
            ...reconciledAiCustomizations,
            [customization]: studentAiCustomizations[customization],
          };
        }
      }

      // Make sure model ID is valid
      reconciledAiCustomizations = {
        ...reconciledAiCustomizations,
        selectedModelId: validateModelId(
          reconciledAiCustomizations.selectedModelId
        ),
      };

      state.initialAiCustomizations = reconciledAiCustomizations;
      state.savedAiCustomizations = reconciledAiCustomizations;
      state.currentAiCustomizations = reconciledAiCustomizations;
      state.fieldVisibilities =
        levelAichatSettings?.visibilities || DEFAULT_VISIBILITIES;

      // Reset sent message and updated customizations flags
      state.hasSentMessage = false;
      state.hasUpdatedCustomizations = false;
      state.hasSetStartingCustomizations = true;
    },
    clearHasSetStartingCustomizations: state => {
      state.hasSetStartingCustomizations = false;
    },
    resetToDefaultAiCustomizations: (
      state,
      action: PayloadAction<LevelAichatSettings | undefined>
    ) => {
      const levelAichatSettings = action.payload;

      let defaultAiCustomizations: AiCustomizations =
        levelAichatSettings?.initialCustomizations || EMPTY_AI_CUSTOMIZATIONS;

      // Make sure model ID is valid
      defaultAiCustomizations = {
        ...defaultAiCustomizations,
        selectedModelId: validateModelId(
          defaultAiCustomizations.selectedModelId
        ),
      };

      state.currentAiCustomizations = defaultAiCustomizations;
      state.fieldVisibilities =
        levelAichatSettings?.visibilities || DEFAULT_VISIBILITIES;
      state.showResetMessage = true;
    },
    setSavedAiCustomizations: (
      state,
      action: PayloadAction<AiCustomizations>
    ) => {
      state.savedAiCustomizations = action.payload;
      state.hasUpdatedCustomizations = true;
    },
    setAiCustomizationProperty: <T extends keyof AiCustomizations>(
      state: AichatState,
      action: PayloadAction<{
        property: T;
        value: AiCustomizations[T];
      }>
    ) => {
      const {property, value} = action.payload;
      const updatedAiCustomizations = {
        ...state.currentAiCustomizations,
        [property]: value,
      };
      state.currentAiCustomizations = updatedAiCustomizations;
      // Clear save error and reset message, if any.
      state.saveError = undefined;
      state.showResetMessage = false;
    },
    setModelCardProperty: <T extends keyof ModelCardInfo>(
      state: AichatState,
      action: PayloadAction<{
        property: T;
        value: ModelCardInfo[T];
      }>
    ) => {
      const {property, value} = action.payload;
      const updatedModelCardInfo: ModelCardInfo = {
        ...state.currentAiCustomizations.modelCardInfo,
        [property]: value,
      };
      state.currentAiCustomizations.modelCardInfo = updatedModelCardInfo;
      state.showResetMessage = false;
    },
    startSave(state, action: PayloadAction<SaveType>) {
      state.saveInProgress = true;
      state.currentSaveType = action.payload;
      // Clear save error, if any.
      state.saveError = undefined;
    },
    endSave(state) {
      state.saveInProgress = false;
      state.currentSaveType = undefined;
    },
    addStagedFile(
      state,
      action: PayloadAction<{key: string; asset: ChatAsset; loaded?: boolean}>
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
        status: 'uploaded' | 'uploadFailed' | 'sizeLimitExceeded';
      }>
    ) {
      const {key, status} = action.payload;
      if (status === 'uploaded') {
        const fileIndex = state.stagedFiles.findIndex(file => file.key === key);
        if (fileIndex !== -1) {
          state.stagedFiles[fileIndex].status = 'uploaded';
        }
      } else {
        // Remove from staged files and set alert
        state.stagedFiles = state.stagedFiles.filter(file => file.key !== key);
        state.stagedFilesAlert = status;
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
    setSaveError(state, action: PayloadAction<SaveError | undefined>) {
      state.saveError = action.payload;
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

export const {
  addEventToChatEventsCurrent,
  startSave,
  setChatMessagePending,
  clearChatMessagePending,
  setSavedAiCustomizations,
  updateChatMessageFeedback,
  clearChatMessages,
  endSave,
  removeUpdateMessage,
  resetToDefaultAiCustomizations,
  setAiCustomizationProperty,
  setModelCardProperty,
  setNewChatSession,
  setShowModalType,
  setStartingAiCustomizations,
  setStudentChatHistory,
  setOwnChatHistory,
  setUserHasAichatAccess,
  setClientType,
  setViewMode,
  addStagedFile,
  stagedFileUploadFinished,
  removeStagedFile,
  clearStagedFiles,
  stagedFilesLimitExceeded,
  clearStagedFilesAlert,
  setSaveError,
  clearHasSetStartingCustomizations,
  setChatWorkspaceSelectedTab,
  addItemToUserAddedSelectionContext,
  removeItemFromUserAddedSelectionContext,
  clearUserAddedSelectionContext,
} = aichatSlice.actions;
