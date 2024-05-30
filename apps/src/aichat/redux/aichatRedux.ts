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
  AiInteractionStatus as Status,
  AichatErrorType,
} from '@cdo/generated-scripts/sharedConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';

import {
  AI_CUSTOMIZATIONS_LABELS,
  DEFAULT_VISIBILITIES,
  EMPTY_AI_CUSTOMIZATIONS,
} from '../views/modelCustomization/constants';
import {postAichatCompletionMessage} from '../aichatCompletionApi';
import {
  AiCustomizations,
  AichatInteractionStatusValue,
  ChatCompletionMessage,
  AichatContext,
  LevelAichatSettings,
  ModelCardInfo,
  Role,
  ViewMode,
  Visibility,
} from '../types';
import {getTypedKeys} from '@cdo/apps/types/utils';

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
    const rootState = (await thunkAPI.getState()) as RootState;
    const {currentAiCustomizations, savedAiCustomizations} = rootState.aichat;
    const {dispatch} = thunkAPI;

    await saveAiCustomization(
      currentAiCustomizations,
      savedAiCustomizations,
      EVENTS.UPDATE_CHATBOT,
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
      EVENTS.PUBLISH_MODEL_CARD_INFO,
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
    const rootState = (await thunkAPI.getState()) as RootState;
    const modelCardInfo =
      rootState.aichat.currentAiCustomizations.modelCardInfo;
    if (!hasFilledOutModelCard(modelCardInfo)) {
      dispatch(setModelCardProperty({property: 'isPublished', value: false}));
    }

    const {currentAiCustomizations, savedAiCustomizations} = (
      thunkAPI.getState() as RootState
    ).aichat;
    await saveAiCustomization(
      currentAiCustomizations,
      savedAiCustomizations,
      EVENTS.SAVE_MODEL_CARD_INFO,
      dispatch
    );
  }
);

// This variable keeps track of the most recent message ID so that we can
// assign a unique message id in increasing sequence to a new message.
let latestMessageId = 0;
const getNewMessageId = () => {
  latestMessageId += 1;
  return latestMessageId;
};

export const RESET_MODEL_NOTIFICATION: ChatCompletionMessage = {
  id: getNewMessageId(),
  role: Role.MODEL_UPDATE,
  chatMessageText: 'Model customizations and model card information',
  chatMessageSuffix: ' have been reset to default settings.',
  status: Status.OK,
  timestamp: getCurrentTime(),
};

// This is the "core" update logic that is shared when a student saves their
// model customizations (setup, retrieval, and "publish" tab)
const saveAiCustomization = async (
  currentAiCustomizations: AiCustomizations,
  savedAiCustomizations: AiCustomizations,
  eventDescription: string,
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
        id: getNewMessageId(),
        role: Role.MODEL_UPDATE,
        chatMessageText:
          AI_CUSTOMIZATIONS_LABELS[property as keyof AiCustomizations],
        chatMessageSuffix: ' has been updated.',
        status: Status.OK,
        timestamp: getCurrentTime(),
      })
    );
    if (eventDescription) {
      analyticsReporter.sendEvent(
        eventDescription,
        {
          propertyUpdated: property,
          levelPath: window.location.pathname,
        },
        PLATFORMS.BOTH
      );
    }
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

    const aichatContext: AichatContext = {
      currentLevelId: parseInt(state.progress.currentLevelId || ''),
      scriptId: state.progress.scriptId,
      channelId: state.lab.channel?.id,
    };
    // Create the new user ChatCompleteMessage and add to chatMessages.
    const newMessage: ChatCompletionMessage = {
      id: getNewMessageId(),
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: newUserMessageText,
      timestamp: getCurrentTimestamp(),
      sessionId: currentSessionId,
    };
    thunkAPI.dispatch(addChatMessage(newMessage));

    // Post user content and messages to backend and retrieve assistant response.
    const startTime = Date.now();
    const chatApiResponse = await postAichatCompletionMessage(
      newUserMessageText,
      currentSessionId
        ? storedMessages.filter(
            message => message.sessionId === currentSessionId
          )
        : [],
      aiCustomizations,
      aichatContext,
      currentSessionId
    );
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .reportLoadTime('AichatModelResponseTime', Date.now() - startTime, [
        {
          name: 'ModelId',
          value: aiCustomizations.selectedModelId,
        },
      ]);

    // Regardless of response type,
    // assign last user message to session.
    if (chatApiResponse.session_id) {
      thunkAPI.dispatch(setChatSessionId(chatApiResponse.session_id));
      thunkAPI.dispatch(
        updateChatMessageSession({
          id: newMessage.id,
          sessionId: chatApiResponse.session_id,
        })
      );
    }

    // success state: received response from model ("assistant")
    if (chatApiResponse?.role === Role.ASSISTANT) {
      const assistantChatMessage: ChatCompletionMessage = {
        id: getNewMessageId(),
        role: Role.ASSISTANT,
        status: Status.OK,
        chatMessageText: chatApiResponse.content,
        timestamp: getCurrentTimestamp(),
        sessionId: chatApiResponse.session_id,
      };
      thunkAPI.dispatch(addChatMessage(assistantChatMessage));

      thunkAPI.dispatch(
        updateUserChatMessageStatus({
          id: newMessage.id,
          status: Status.OK,
        })
      );

      // error state #1: model generated profanity
    } else if (chatApiResponse?.status === AichatErrorType.PROFANITY_MODEL) {
      const assistantChatMessage: ChatCompletionMessage = {
        id: getNewMessageId(),
        role: Role.ASSISTANT,
        status: Status.ERROR,
        chatMessageText: 'error',
        timestamp: getCurrentTimestamp(),
      };
      thunkAPI.dispatch(addChatMessage(assistantChatMessage));

      thunkAPI.dispatch(
        updateUserChatMessageStatus({
          id: newMessage.id,
          status: Status.ERROR,
        })
      );

      // error state #2: user message contained profanity
    } else if (chatApiResponse?.status === AichatErrorType.PROFANITY_USER) {
      // Logging to allow visibility into flagged content.
      console.log(chatApiResponse);

      thunkAPI.dispatch(
        updateUserChatMessageStatus({
          id: newMessage.id,
          status: Status.PROFANITY_VIOLATION,
        })
      );
    }
  }
);

const aichatSlice = createSlice({
  name: 'aichat',
  initialState,
  reducers: {
    addChatMessage: (state, action: PayloadAction<ChatCompletionMessage>) => {
      state.chatMessages.push(action.payload);
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
      state.currentSessionId = undefined;
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
    updateUserChatMessageStatus: (
      state,
      action: PayloadAction<{id: number; status: AichatInteractionStatusValue}>
    ) => {
      const {id, status} = action.payload;
      const chatMessage = state.chatMessages.find(msg => msg.id === id);
      if (chatMessage && chatMessage.role === Role.USER) {
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
    resetToDefaultAiCustomizations: (
      state,
      action: PayloadAction<LevelAichatSettings | undefined>
    ) => {
      const levelAichatSettings = action.payload;

      const defaultAiCustomizations: AiCustomizations =
        levelAichatSettings?.initialCustomizations || EMPTY_AI_CUSTOMIZATIONS;

      state.savedAiCustomizations = defaultAiCustomizations;
      state.currentAiCustomizations = defaultAiCustomizations;
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
  for (const key of getTypedKeys(modelCardInfo)) {
    if (key === 'isPublished') {
      continue;
    } else if (key === 'exampleTopics') {
      if (
        !modelCardInfo['exampleTopics'].filter(topic => topic.length).length
      ) {
        return false;
      }
    } else if (!modelCardInfo[key].length) {
      return false;
    }
  }

  return true;
};

const allFieldsHidden = (fieldVisibilities: AichatState['fieldVisibilities']) =>
  getTypedKeys(fieldVisibilities).every(
    key => fieldVisibilities[key] === Visibility.HIDDEN
  );

// Selectors
export const selectHasFilledOutModelCard = createSelector(
  (state: RootState) => state.aichat.currentAiCustomizations.modelCardInfo,
  hasFilledOutModelCard
);

export const selectAllFieldsHidden = createSelector(
  (state: RootState) => state.aichat.fieldVisibilities,
  allFieldsHidden
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
  updateUserChatMessageStatus,
  updateChatMessageSession,
  resetToDefaultAiCustomizations,
  setViewMode,
  setStartingAiCustomizations,
  setSavedAiCustomizations,
  setAiCustomizationProperty,
  setModelCardProperty,
} = aichatSlice.actions;
