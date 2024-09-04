import {
  createAsyncThunk,
  createSlice,
  createSelector,
  AnyAction,
  PayloadAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  getCurrentScriptLevelId,
  getCurrentLevel,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {registerReducers} from '@cdo/apps/redux';
import {commonI18n} from '@cdo/apps/types/locale';
import {RootState} from '@cdo/apps/types/redux';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {
  getStudentChatHistory,
  getUserHasAichatAccess,
  postAichatCompletionMessage,
} from '../aichatApi';
import ChatEventLogger from '../chatEventLogger';
import {saveTypeToAnalyticsEvent} from '../constants';
import {
  AichatContext,
  AiCustomizations,
  ChatEvent,
  ChatMessage,
  FieldVisibilities,
  LevelAichatSettings,
  ModelCardInfo,
  SaveType,
  ViewMode,
  Visibility,
  isModelUpdate,
  isNotification,
  isChatMessage,
} from '../types';
import {
  DEFAULT_VISIBILITIES,
  EMPTY_AI_CUSTOMIZATIONS,
} from '../views/modelCustomization/constants';
import {validateModelId} from '../views/modelCustomization/utils';

import {
  allFieldsHidden,
  anyFieldsChanged,
  findChangedProperties,
  getNewMessageId,
  hasFilledOutModelCard,
} from './utils';

const messageListKeys = ['chatEventsPast', 'chatEventsCurrent'] as const;
type MessageLocation = {
  index: number;
  messageListKey: (typeof messageListKeys)[number];
};

export interface AichatState {
  // Content from previous chat sessions that we track purely for visibility to the user
  // and do not send to the model as history.
  chatEventsPast: ChatEvent[];
  // Items in the current chat session that we want to provide as history to the model.
  chatEventsCurrent: ChatEvent[];
  // The user message currently awaiting response from the model (if any).
  chatMessagePending?: ChatMessage;
  // Denotes whether we are waiting for a chat completion response from the backend
  isWaitingForChatResponse: boolean;
  // Student events viewed by a teacher user in chat workspace
  studentChatHistory: ChatEvent[];
  // Denotes whether we should show the warning modal
  showWarningModal: boolean;
  // Denotes if there is an error with the chat completion response
  chatMessageError: boolean;
  initialAiCustomizations: AiCustomizations;
  currentAiCustomizations: AiCustomizations;
  savedAiCustomizations: AiCustomizations;
  fieldVisibilities: FieldVisibilities;
  viewMode: ViewMode;
  // If a save is currently in progress
  saveInProgress: boolean;
  // The type of save action being performed (customization update, publish, model card save, etc).
  currentSaveType: SaveType | undefined;
  userHasAichatAccess: boolean | undefined;
}

const initialState: AichatState = {
  chatEventsPast: [],
  chatEventsCurrent: [],
  chatMessagePending: undefined,
  isWaitingForChatResponse: false,
  studentChatHistory: [],
  showWarningModal: true,
  chatMessageError: false,
  initialAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  currentAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  savedAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  fieldVisibilities: DEFAULT_VISIBILITIES,
  viewMode: ViewMode.EDIT,
  saveInProgress: false,
  currentSaveType: undefined,
  userHasAichatAccess: undefined,
};

// THUNKS

// This thunk saves a student's AI customizations using the Project Manager (ie, to S3 typically),
// then does a comparison between the previous and current saved customizations in order to
// output a message to the chat window with the list of customizations that were updated.
export const updateAiCustomization = createAsyncThunk(
  'aichat/updateAiCustomization',
  async (_, {dispatch, getState}) => {
    await saveAiCustomization(
      (getState() as RootState).aichat.currentAiCustomizations,
      'updateChatbot',
      dispatch
    );
  }
);

// This thunk is used when a student fills out a model card and "publishes" their model,
// enabling access to a "presentation view" where they can interact with their model
// and view its details (temperature, system prompt, etc) in a summary view.
export const publishModel = createAsyncThunk(
  'aichat/publishModelCard',
  async (_, {dispatch, getState}) => {
    dispatch(setModelCardProperty({property: 'isPublished', value: true}));
    await saveAiCustomization(
      (getState() as RootState).aichat.currentAiCustomizations,
      'publishModelCard',
      dispatch
    );
  }
);

// This thunk enables a student to save a partially completed model card
// in the "Publish" tab.
export const saveModelCard = createAsyncThunk(
  'aichat/saveModelCard',
  async (_, {dispatch, getState}) => {
    const {currentAiCustomizations} = (getState() as RootState).aichat;
    const modelCardInfo = currentAiCustomizations.modelCardInfo;
    if (!hasFilledOutModelCard(modelCardInfo)) {
      dispatch(setModelCardProperty({property: 'isPublished', value: false}));
    }

    await saveAiCustomization(
      currentAiCustomizations,
      'saveModelCard',
      dispatch
    );
  }
);

// This is the "core" update logic that is shared when a student saves their
// model customizations (setup, retrieval, and "publish" tab)
const saveAiCustomization = async (
  currentAiCustomizations: AiCustomizations,
  saveType: SaveType,
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

  // Notify the UI that a save is in progress.
  dispatch(startSave(saveType));

  await Lab2Registry.getInstance()
    .getProjectManager()
    ?.save({source: JSON.stringify(trimmedCurrentAiCustomizations)}, true);
};

// Thunk called after a save has completed successfully.
// Updates the chat window and reports analytics as necessary.
export const onSaveComplete =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const {
      savedAiCustomizations,
      currentAiCustomizations,
      currentSaveType,
      userHasAichatAccess,
    } = getState().aichat;

    const changedProperties = findChangedProperties(
      savedAiCustomizations,
      currentAiCustomizations
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
      const typedProperty = property as keyof AiCustomizations;
      const modelUpdate = {
        id: getNewMessageId(),
        updatedField: typedProperty,
        updatedValue: currentAiCustomizations[typedProperty],
        timestamp: Date.now(),
      };
      dispatch(addChatEvent(modelUpdate));

      // Report to analytics the changed value for only selected model id and temperature properties.
      // Do not include the free text changes (system prompt and retrieval contexts).
      const propertiesChangedValueToReport = ['selectedModelId', 'temperature'];
      const propertyChangedTo = propertiesChangedValueToReport.includes(
        typedProperty
      )
        ? currentAiCustomizations[typedProperty]
        : 'NULL';
      if (currentSaveType && userHasAichatAccess) {
        analyticsReporter.sendEvent(
          saveTypeToAnalyticsEvent[currentSaveType],
          {
            propertyUpdated: property,
            propertyChangedTo,
            levelPath: window.location.pathname,
          },
          PLATFORMS.BOTH
        );
      }
    });

    // Update our last saved customizations to match the current customizations
    dispatch(setSavedAiCustomizations(currentAiCustomizations));
    // Notify the UI that the save is complete.
    dispatch(endSave());
    // Go to the presentation page if we just finished publishing the model card.
    if (currentSaveType === 'publishModelCard') {
      dispatch(setViewMode(ViewMode.PRESENTATION));
    }
  };

// Thunk called when a save no-ops (there are no changes to save)
export const onSaveNoop =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    // Even if no changes were saved, go to the presentation page if the user tried to publish
    // a model card.
    if (getState().aichat.currentSaveType === 'publishModelCard') {
      dispatch(setViewMode(ViewMode.PRESENTATION));
    }
    dispatch(endSave());
  };

// Thunk called when a save has failed.
export const onSaveFail =
  (e: Error) => (dispatch: AppDispatch, getState: () => RootState) => {
    // Default save error message.
    let errorMessage =
      'There was an error saving your project. Please try again.';
    if (e instanceof NetworkError) {
      e.response
        .json()
        .then(body => {
          const changedProperties = findChangedProperties(
            getState().aichat.savedAiCustomizations,
            getState().aichat.currentAiCustomizations
          );
          let flaggedProperties;
          if (
            changedProperties.includes('systemPrompt') &&
            changedProperties.includes('retrievalContexts')
          ) {
            flaggedProperties = 'system prompt and/or retrieval contexts';
          } else if (changedProperties.includes('systemPrompt')) {
            flaggedProperties = 'system prompt';
          } else if (changedProperties.includes('retrievalContexts')) {
            flaggedProperties = 'retrieval contexts';
          }
          if (body?.details?.profaneWords?.length > 0 && flaggedProperties) {
            errorMessage = `Profanity detected in the ${flaggedProperties} and cannot be updated. Please try again.`;
          }
          dispatchSaveFailNotification(
            dispatch,
            errorMessage,
            !!flaggedProperties
          );
        })
        // Catch any errors in parsing the response body or if there was no response body
        // and fall back to the default error message.
        .catch(() => {
          dispatchSaveFailNotification(dispatch, errorMessage);
        });
    } else {
      // If an Error was passed instead of a NetworkError, fall back to the default error message.
      dispatchSaveFailNotification(dispatch, errorMessage);
    }
  };

const dispatchSaveFailNotification = (
  dispatch: AppDispatch,
  errorMessage: string,
  includeInChatHistory?: boolean
) => {
  const errorNotification = {
    id: getNewMessageId(),
    text: errorMessage,
    notificationType: 'error',
    timestamp: Date.now(),
    includeInChatHistory,
  };
  dispatch(addChatEvent(errorNotification));

  // Notify the UI that the save is complete.
  dispatch(endSave());
};

// This thunk adds a chat event to chatEventsCurrent (displayed in current chat workspace) if visible, i.e.,
// hideForParticipants != true. Then it logs the event to the backend for all chat events except notifications
// with includeInHistory != true.
export const addChatEvent =
  <T extends ChatEvent>(chatEvent: T) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    // Only visible chat events added to chatEventsCurrent.
    if (!chatEvent.hideForParticipants) {
      dispatch(addEventToChatEventsCurrent(chatEvent));
    }
    // Log chat event to backend.
    const state = getState() as RootState;
    const aichatContext: AichatContext = {
      currentLevelId: parseInt(state.progress.currentLevelId || ''),
      scriptId: state.progress.scriptId,
      channelId: state.lab.channel?.id,
    };
    // Other than notifications that are not included in chat history (save errors not due to profanity),
    // log the chat event to backend.
    if (
      !isNotification(chatEvent) ||
      (isNotification(chatEvent) && chatEvent.includeInChatHistory)
    ) {
      // If a model update, log only the updated value for temperature and selected model id.
      // Do not log free text updated values (e.g., system prompt, retrieval contexts, model card info).
      if (isModelUpdate(chatEvent)) {
        const {updatedField, updatedValue} = chatEvent;
        // Only log updated value for temperature and selected model id - free text values are not logged.
        const updatedValueToLog =
          updatedField === 'temperature' || updatedField === 'selectedModelId'
            ? updatedValue
            : 'N/A';
        chatEvent = {
          ...chatEvent,
          updatedValue: updatedValueToLog,
        };
      }
      ChatEventLogger.getInstance().logChatEvent(chatEvent, aichatContext);
    }
  };

// This thunk's callback function returns if a user has aichat acess.
export const fetchUserHasAichatAccess = createAsyncThunk(
  'aichat/fetchUserHasAichatAccess',
  async (__, thunkAPI) => {
    try {
      const {userHasAccess} = await getUserHasAichatAccess();
      thunkAPI.dispatch(setUserHasAichatAccess(userHasAccess));
    } catch (error) {
      if (!(error instanceof NetworkError && error.response.status === 403)) {
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Error in fetching user aichat access', error as Error);
        return;
      }
    }
  }
);

// This thunk's callback function submits a user's chat content and AI customizations to
// the chat completion endpoint, then waits for a chat completion response, and updates
// the user messages.
export const submitChatContents = createAsyncThunk(
  'aichat/submitChatContents',
  async (newUserMessageText: string, thunkAPI) => {
    const dispatch = thunkAPI.dispatch as AppDispatch;
    const state = thunkAPI.getState() as RootState;
    const {savedAiCustomizations: aiCustomizations, chatEventsCurrent} =
      state.aichat;

    const aichatContext: AichatContext = {
      currentLevelId: parseInt(state.progress.currentLevelId || ''),
      scriptId: state.progress.scriptId,
      channelId: state.lab.channel?.id,
    };
    // Create the new user ChatCompleteMessage and add to chatMessages.
    const newUserMessage: ChatMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: newUserMessageText,
      timestamp: Date.now(),
    };
    dispatch(setChatMessagePending(newUserMessage));

    // Post user content and messages to backend and retrieve assistant response.
    const startTime = Date.now();

    let chatApiResponse;
    try {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .incrementCounter('Aichat.ChatCompletionRequestInitiated');
      chatApiResponse = await postAichatCompletionMessage(
        newUserMessage,
        chatEventsCurrent.filter(isChatMessage) as ChatMessage[],
        aiCustomizations,
        aichatContext
      );
      analyticsReporter.sendEvent(
        EVENTS.SUBMIT_AICHAT_REQUEST_SUCCESS,
        {
          levelPath: window.location.pathname,
          userMessage: newUserMessageText,
        },
        PLATFORMS.BOTH
      );
    } catch (error) {
      await handleChatCompletionError(error as Error, newUserMessage, dispatch);
      return;
    }

    Lab2Registry.getInstance()
      .getMetricsReporter()
      .reportLoadTime('AichatModelResponseTime', Date.now() - startTime, [
        {
          name: 'ModelId',
          value: aiCustomizations.selectedModelId,
        },
      ]);

    if (chatApiResponse.flagged_content) {
      console.log(
        `Content flagged by profanity filter: ${chatApiResponse.flagged_content}`
      );
    }

    thunkAPI.dispatch(clearChatMessagePending());
    chatApiResponse.messages.forEach(message => {
      dispatch(addChatEvent({...message, timestamp: Date.now()}));
    });
  }
);

async function handleChatCompletionError(
  error: Error,
  newUserMessage: ChatMessage,
  dispatch: AppDispatch
) {
  Lab2Registry.getInstance()
    .getMetricsReporter()
    .logError('Error in aichat completion request', error as Error);

  dispatch(clearChatMessagePending());
  dispatch(addChatEvent({...newUserMessage, status: Status.ERROR}));

  // Display specific error notifications if the user was rate limited (HTTP 429) or not authorized (HTTP 403).
  // Otherwise, display a generic error assistant response.
  if (error instanceof NetworkError && error.response.status === 429) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('Aichat.ChatCompletionErrorRateLimited');
    dispatch(
      addChatEvent({
        id: getNewMessageId(),
        text: commonI18n.aiChatRateLimitError(),
        notificationType: 'error',
        timestamp: Date.now(),
      })
    );
  } else if (error instanceof NetworkError && error.response.status === 403) {
    const responseBody = await error.response.json();
    const userType = responseBody?.user_type;

    const userTypeToMessageText: {[key: string]: string} = {
      teacher: commonI18n.aiChatNotAuthorizedTeacher(),
      student: commonI18n.aiChatNotAuthorizedStudent(),
    };
    const messageText =
      userTypeToMessageText[userType] ||
      commonI18n.aiChatNotAuthorizedSignedOut();

    dispatch(
      addChatEvent({
        id: getNewMessageId(),
        text: messageText,
        notificationType: 'error',
        timestamp: Date.now(),
      })
    );
    analyticsReporter.sendEvent(
      EVENTS.SUBMIT_AICHAT_REQUEST_UNAUTHORIZED,
      {
        levelPath: window.location.pathname,
        userType,
        userMessage: newUserMessage.chatMessageText,
      },
      PLATFORMS.BOTH
    );
  } else {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('Aichat.ChatCompletionErrorUnhandled');
    dispatch(
      addChatEvent({
        role: Role.ASSISTANT,
        status: Status.ERROR,
        chatMessageText: 'error',
        timestamp: Date.now(),
      })
    );
  }
}

// This thunk's callback function submits a teacher's student's id along with the level/script id
// (and the scriptLevelId if the level is a sublevel) to the student chat history endpoint,
// waits for a response, and then returns the student's chat events for that level/script.
export const fetchStudentChatHistory = createAsyncThunk(
  'aichat/fetchStudentChatHistory',
  async (studentUserId: number, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    // Post teacher's student's user id to backend and retrieve student's chat history.
    const currentLevel = getCurrentLevel(state);
    // The scriptLevelId is sent to the backend if the current level is a sublevel so that we can
    // correctly check if the teacher has permission to view the student's chat history.
    const scriptLevelId = currentLevel.parentLevelId
      ? getCurrentScriptLevelId(state)
      : undefined;
    try {
      const studentChatHistoryApiResponse = await getStudentChatHistory(
        studentUserId,
        parseInt(state.progress.currentLevelId || ''),
        state.progress.scriptId,
        scriptLevelId
      );
      thunkAPI.dispatch(setStudentChatHistory(studentChatHistoryApiResponse));
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(
          'Error in aichat student chat history request',
          error as Error
        );
      return;
    }
  }
);

const aichatSlice = createSlice({
  name: 'aichat',
  initialState,
  reducers: {
    addEventToChatEventsCurrent: (state, action: PayloadAction<ChatEvent>) => {
      state.chatEventsCurrent.push(action.payload);
    },
    setStudentChatHistory: (state, action: PayloadAction<ChatEvent[]>) => {
      state.studentChatHistory = action.payload;
    },
    setUserHasAichatAccess: (
      state,
      action: PayloadAction<boolean | undefined>
    ) => {
      state.userHasAichatAccess = action.payload;
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
    clearChatMessages: state => {
      state.chatEventsPast = [];
      state.chatEventsCurrent = [];
    },
    setChatMessagePending: (state, action: PayloadAction<ChatMessage>) => {
      state.chatMessagePending = action.payload;
    },
    clearChatMessagePending: state => (state.chatMessagePending = undefined),
    setNewChatSession: state => {
      state.chatEventsPast.push(...state.chatEventsCurrent);
      state.chatEventsCurrent = [];
    },
    setShowWarningModal: (state, action: PayloadAction<boolean>) => {
      state.showWarningModal = action.payload;
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
    startSave(state, action: PayloadAction<SaveType>) {
      state.saveInProgress = true;
      state.currentSaveType = action.payload;
    },
    endSave(state) {
      state.saveInProgress = false;
      state.currentSaveType = undefined;
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

const getUpdateMessageLocation = (
  id: number,
  state: AichatState
): MessageLocation | undefined => {
  for (const messageListKey of messageListKeys) {
    const messageList = state[messageListKey];

    // Only allow removing individual messages that are model updates and error notifications,
    // as we want to retain user and bot message history
    // when requesting model responses within a chat session.
    // If we want to clear all history
    // and start a new session, see clearChatMessages.
    const itemToRemovePosition = messageList.findIndex(
      message =>
        (isModelUpdate(message) && message.id === id) ||
        (isNotification(message) && message.id === id)
    );

    if (itemToRemovePosition >= 0) {
      return {index: itemToRemovePosition, messageListKey};
    }
  }
};

// Selectors
export const selectHasFilledOutModelCard = createSelector(
  (state: RootState) => state.aichat.currentAiCustomizations.modelCardInfo,
  hasFilledOutModelCard
);

export const selectAllFieldsHidden = createSelector(
  (state: RootState) => state.aichat.fieldVisibilities,
  allFieldsHidden
);

export const selectCurrentCustomizationsMatchInitial = createSelector(
  (state: RootState) => state.aichat.initialAiCustomizations,
  (state: RootState) => state.aichat.currentAiCustomizations,
  anyFieldsChanged
);

export const selectSavedCustomizationsMatchInitial = createSelector(
  (state: RootState) => state.aichat.initialAiCustomizations,
  (state: RootState) => state.aichat.savedAiCustomizations,
  anyFieldsChanged
);

export const selectAllVisibleMessages = (state: {aichat: AichatState}) => {
  const {chatEventsPast, chatEventsCurrent, chatMessagePending} = state.aichat;
  const messages = [...chatEventsPast, ...chatEventsCurrent];
  if (chatMessagePending) {
    messages.push(chatMessagePending);
  }
  return messages;
};

export const selectHavePropertiesChanged = (state: RootState) =>
  findChangedProperties(
    state.aichat.savedAiCustomizations,
    state.aichat.currentAiCustomizations
  ).length > 0;

// Actions not to be used outside of this file
const {
  addEventToChatEventsCurrent,
  startSave,
  setChatMessagePending,
  clearChatMessagePending,
  setSavedAiCustomizations,
} = aichatSlice.actions;

registerReducers({aichat: aichatSlice.reducer});
export const {
  clearChatMessages,
  endSave,
  removeUpdateMessage,
  resetToDefaultAiCustomizations,
  setAiCustomizationProperty,
  setModelCardProperty,
  setNewChatSession,
  setShowWarningModal,
  setStartingAiCustomizations,
  setStudentChatHistory,
  setUserHasAichatAccess,
  setViewMode,
} = aichatSlice.actions;
