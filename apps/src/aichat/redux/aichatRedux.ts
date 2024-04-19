import moment from 'moment';
import {
  createAsyncThunk,
  createSlice,
  createSelector,
  AnyAction,
  PayloadAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';
import {RootState} from '@cdo/apps/types/redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {
  AI_CUSTOMIZATIONS_LABELS,
  DEFAULT_VISIBILITIES,
  EMPTY_AI_CUSTOMIZATIONS,
} from '../views/modelCustomization/constants';
import {postAichatCompletionMessage} from '../aichatCompletionApi';
import {
  AiCustomizations,
  AichatInteractionStatus as Status,
  ChatCompletionMessage,
  ChatContext,
  LevelAichatSettings,
  ModelCardInfo,
  Role,
  ViewMode,
  Visibility,
} from '../types';

const haveDifferentValues = (
  value1: AiCustomizations[keyof AiCustomizations],
  value2: AiCustomizations[keyof AiCustomizations]
): boolean => {
  if (typeof value1 === 'object' && typeof value2 === 'object') {
    return JSON.stringify(value1) !== JSON.stringify(value2);
  }

  return value1 !== value2;
};

const findChangedProperties = (
  previous: AiCustomizations | undefined,
  next: AiCustomizations
) => {
  if (!previous) {
    return Object.keys(next);
  }

  const changedProperties: string[] = [];
  Object.keys(next).forEach(key => {
    const typedKey = key as keyof AiCustomizations;
    if (haveDifferentValues(previous[typedKey], next[typedKey])) {
      changedProperties.push(key);
    }
  });

  return changedProperties;
};

const getCurrentTimestamp = () => moment(Date.now()).format('YYYY-MM-DD HH:mm');
const getCurrentTime = () => moment(Date.now()).format('LT');

export interface AichatState {
  // All user and assistant chat messages - includes too personal and inappropriate user messages.
  // Messages will be logged and stored.
  chatMessages: ChatCompletionMessage[];
  // Denotes whether we are waiting for a chat completion response from the backend
  isWaitingForChatResponse: boolean;
  // Denotes whether we should show the warning modal
  showWarningModal: boolean;
  // Denotes if there is an error with the chat completion response
  chatMessageError: boolean;
  currentAiCustomizations: AiCustomizations;
  savedAiCustomizations: AiCustomizations;
  fieldVisibilities: {[key in keyof AiCustomizations]: Visibility};
  viewMode: ViewMode;
  currentSessionId?: number;
}

const initialState: AichatState = {
  chatMessages: [],
  isWaitingForChatResponse: false,
  showWarningModal: true,
  chatMessageError: false,
  currentAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  savedAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  fieldVisibilities: DEFAULT_VISIBILITIES,
  viewMode: ViewMode.EDIT,
};

// THUNKS

// This thunk saves a student's AI customizations using the Project Manager (ie, to S3 typically),
// then does a comparison between the previous and current saved customizations in order to
// output a message to the chat window with the list of customizations that were updated.
export const updateAiCustomization = createAsyncThunk(
  'aichat/updateAiCustomization',
  async (_, thunkAPI) => {
    const rootState = thunkAPI.getState() as RootState;
    const {currentAiCustomizations, savedAiCustomizations} = rootState.aichat;
    const {dispatch} = thunkAPI;

    await saveAiCustomization(
      currentAiCustomizations,
      savedAiCustomizations,
      dispatch
    );
  }
);

// This thunk is used when a student fills out a model card and "publishes" their model,
// enabling access to a "presentation view" where they can interact with their model
// and view its details (temperature, system prompt, etc) in a summary view.
export const publishModel = createAsyncThunk(
  'aichat/publishModelCard',
  async (_, thunkAPI) => {
    const {dispatch} = thunkAPI;
    dispatch(setModelCardProperty({property: 'isPublished', value: true}));

    const rootState = thunkAPI.getState() as RootState;
    const {currentAiCustomizations, savedAiCustomizations} = rootState.aichat;
    await saveAiCustomization(
      currentAiCustomizations,
      savedAiCustomizations,
      dispatch
    );
    dispatch(setViewMode(ViewMode.PRESENTATION));
  }
);

// This thunk enables a student to save a partially completed model card
// in the "Publish" tab.
export const saveModelCard = createAsyncThunk(
  'aichat/saveModelCard',
  async (_, thunkAPI) => {
    const {dispatch} = thunkAPI;
    const modelCardInfo = (thunkAPI.getState() as RootState).aichat
      .currentAiCustomizations.modelCardInfo;
    if (!hasFilledOutModelCard(modelCardInfo)) {
      dispatch(setModelCardProperty({property: 'isPublished', value: false}));
    }

    const {currentAiCustomizations, savedAiCustomizations} = (
      thunkAPI.getState() as RootState
    ).aichat;
    await saveAiCustomization(
      currentAiCustomizations,
      savedAiCustomizations,
      dispatch
    );
  }
);

// This is the "core" update logic that is shared when a student saves their
// model customizations (setup, retrieval, and "publish" tab)
const saveAiCustomization = async (
  currentAiCustomizations: AiCustomizations,
  savedAiCustomizations: AiCustomizations,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) => {
  // Remove any empty example topics on save
  const trimmedExampleTopics =
    currentAiCustomizations.modelCardInfo.exampleTopics.filter(
      topic => topic.length
    );
  dispatch(
    setModelCardProperty({
      property: 'exampleTopics',
      value: trimmedExampleTopics,
    })
  );

  const trimmedCurrentAiCustomizations = {
    ...currentAiCustomizations,
    modelCardInfo: {
      ...currentAiCustomizations.modelCardInfo,
      exampleTopics: trimmedExampleTopics,
    },
  };

  await Lab2Registry.getInstance()
    .getProjectManager()
    ?.save({source: JSON.stringify(trimmedCurrentAiCustomizations)}, true);

  dispatch(setSavedAiCustomizations(trimmedCurrentAiCustomizations));

  const changedProperties = findChangedProperties(
    savedAiCustomizations,
    trimmedCurrentAiCustomizations
  );

  if (
    changedProperties.some(property =>
      [
        'selectedModelId',
        'temperature',
        'systemPrompt',
        'retrievalContexts',
      ].includes(property)
    )
  ) {
    dispatch(setNewChatSession());
  }

  changedProperties.forEach(property => {
    dispatch(
      addChatMessage({
        id: 0,
        role: Role.MODEL_UPDATE,
        chatMessageText:
          AI_CUSTOMIZATIONS_LABELS[property as keyof AiCustomizations],
        status: Status.OK,
        timestamp: getCurrentTime(),
      })
    );
  });
};

// This thunk's callback function submits a user's chat content and AI customizations to
// the chat completion endpoint, then waits for a chat completion response, and updates
// the user messages.
export const submitChatContents = createAsyncThunk(
  'aichat/submitChatContents',
  async (newUserMessageText: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const {
      savedAiCustomizations: aiCustomizations,
      chatMessages: storedMessages,
      currentSessionId,
    } = state.aichat;

    const chatContext: ChatContext = {
      userId: state.currentUser.userId,
      currentLevelId: state.progress.currentLevelId,
      scriptId: state.progress.scriptId,
      channelId: state.lab.channel?.id,
    };
    const newMessageId =
      storedMessages.length === 0
        ? 1
        : storedMessages[storedMessages.length - 1].id + 1;

    // Create the new user ChatCompleteMessage and add to chatMessages.
    const newMessage: ChatCompletionMessage = {
      id: newMessageId,
      role: Role.USER,
      status: Status.OK,
      chatMessageText: newUserMessageText,
      timestamp: getCurrentTimestamp(),
      sessionId: currentSessionId,
    };
    thunkAPI.dispatch(addChatMessage(newMessage));

    // Post user content and messages to backend and retrieve assistant response.

    const chatApiResponse = await postAichatCompletionMessage(
      newUserMessageText,
      currentSessionId
        ? storedMessages.filter(
            message => message.sessionId === currentSessionId
          )
        : [],
      aiCustomizations,
      chatContext
    );
    console.log('chatApiResponse', chatApiResponse);

    // TODO: error handling
    thunkAPI.dispatch(setChatSessionId(chatApiResponse.sessionId));
    thunkAPI.dispatch(
      updateChatMessageSession({
        id: newMessageId,
        sessionId: chatApiResponse.sessionId,
      })
    );

    if (chatApiResponse?.role === Role.ASSISTANT) {
      const assistantChatMessage: ChatCompletionMessage = {
        id: newMessageId + 1,
        role: Role.ASSISTANT,
        status: Status.OK,
        chatMessageText: chatApiResponse.content,
        // The accuracy of this timestamp is debatable since it's not when our backend
        // issued the message, but it's good enough for user testing.
        timestamp: getCurrentTimestamp(),
        sessionId: chatApiResponse.sessionId,
      };
      thunkAPI.dispatch(addChatMessage(assistantChatMessage));
    } else {
      // TODO: Update most recent user message's status if PII or profanity violation.
      // latest message's id is stored at `newMessageId`.
      console.log('Did not receive assistant response.');
    }
  }
);

const aichatSlice = createSlice({
  name: 'aichat',
  initialState,
  reducers: {
    addChatMessage: (state, action: PayloadAction<ChatCompletionMessage>) => {
      const newMessageId = state.chatMessages.length
        ? state.chatMessages[state.chatMessages.length - 1].id + 1
        : 1;
      const newMessage = {
        ...action.payload,
        id: newMessageId,
      };
      state.chatMessages.push(newMessage);
    },
    removeModelUpdateMessage: (state, action: PayloadAction<number>) => {
      const updatedMessages = [...state.chatMessages];
      const messageToRemovePosition = updatedMessages.findIndex(
        message => message.id === action.payload
      );

      // Only allow removing individual messages that are model updates,
      // as we want to retain user and bot message history
      // when requesting model responses within a chat session.
      // If we want to clear all history
      // and start a new session, see clearChatMessages.
      if (
        messageToRemovePosition < 0 ||
        updatedMessages[messageToRemovePosition].role !== Role.MODEL_UPDATE
      ) {
        return;
      }
      updatedMessages.splice(messageToRemovePosition, 1);

      state.chatMessages = updatedMessages;
    },
    clearChatMessages: state => {
      state.chatMessages = [];
    },
    setNewChatSession: state => {
      state.currentSessionId = undefined;
    },
    setChatSessionId: (state, action: PayloadAction<number>) => {
      state.currentSessionId = action.payload;
    },
    setIsWaitingForChatResponse: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForChatResponse = action.payload;
    },
    setShowWarningModal: (state, action: PayloadAction<boolean>) => {
      state.showWarningModal = action.payload;
    },
    updateChatMessageStatus: (
      state,
      action: PayloadAction<{id: number; status: Status}>
    ) => {
      const {id, status} = action.payload;
      const chatMessage = state.chatMessages.find(msg => msg.id === id);
      if (chatMessage) {
        chatMessage.status = status;
      }
    },
    updateChatMessageSession: (
      state,
      action: PayloadAction<{id: number; sessionId: number}>
    ) => {
      const {id, sessionId} = action.payload;
      const chatMessage = state.chatMessages.find(msg => msg.id === id);
      if (chatMessage) {
        chatMessage.sessionId = sessionId;
      }
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

      state.savedAiCustomizations = reconciledAiCustomizations;
      state.currentAiCustomizations = reconciledAiCustomizations;
      state.fieldVisibilities =
        levelAichatSettings?.visibilities || DEFAULT_VISIBILITIES;
    },
    setSavedAiCustomizations: (
      state,
      action: PayloadAction<AiCustomizations>
    ) => {
      state.savedAiCustomizations = action.payload;
    },
    setAiCustomizationProperty: (
      state,
      action: PayloadAction<{
        property: keyof AiCustomizations;
        value: AiCustomizations[typeof property];
      }>
    ) => {
      const {property, value} = action.payload;
      const updatedAiCustomizations = {
        ...state.currentAiCustomizations,
        [property]: value,
      };
      state.currentAiCustomizations = updatedAiCustomizations;
    },
    setModelCardProperty: (
      state,
      action: PayloadAction<{
        property: keyof ModelCardInfo;
        value: ModelCardInfo[typeof property];
      }>
    ) => {
      const {property, value} = action.payload;

      const updatedModelCardInfo: ModelCardInfo = {
        ...state.currentAiCustomizations.modelCardInfo,
        [property]: value,
      };
      state.currentAiCustomizations.modelCardInfo = updatedModelCardInfo;
    },
  },
  extraReducers: builder => {
    builder.addCase(submitChatContents.fulfilled, state => {
      state.isWaitingForChatResponse = false;
    });
    builder.addCase(submitChatContents.rejected, (state, action) => {
      state.isWaitingForChatResponse = false;
      state.chatMessageError = true;
      console.error(action.error);
    });
    builder.addCase(submitChatContents.pending, state => {
      state.isWaitingForChatResponse = true;
    });
  },
});

const hasFilledOutModelCard = (modelCardInfo: ModelCardInfo) => {
  for (const key of Object.keys(modelCardInfo)) {
    const typedKey = key as keyof ModelCardInfo;

    if (typedKey === 'isPublished') {
      continue;
    } else if (typedKey === 'exampleTopics') {
      if (
        !modelCardInfo['exampleTopics'].filter(topic => topic.length).length
      ) {
        return false;
      }
    } else if (!modelCardInfo[typedKey].length) {
      return false;
    }
  }

  return true;
};

// Selectors
export const selectHasFilledOutModelCard = createSelector(
  (state: {aichat: AichatState}) =>
    state.aichat.currentAiCustomizations.modelCardInfo,
  hasFilledOutModelCard
);

registerReducers({aichat: aichatSlice.reducer});
export const {
  addChatMessage,
  removeModelUpdateMessage,
  setNewChatSession,
  setChatSessionId,
  clearChatMessages,
  setIsWaitingForChatResponse,
  setShowWarningModal,
  updateChatMessageStatus,
  updateChatMessageSession,
  setViewMode,
  setStartingAiCustomizations,
  setSavedAiCustomizations,
  setAiCustomizationProperty,
  setModelCardProperty,
} = aichatSlice.actions;
