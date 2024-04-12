import moment from 'moment';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
const registerReducers = require('@cdo/apps/redux').registerReducers;

import {
  DEFAULT_VISIBILITIES,
  EMPTY_AI_CUSTOMIZATIONS,
  AI_CUSTOMIZATIONS_LABELS,
} from '../views/modelCustomization/constants';
import {initialChatMessages} from '../constants';
import {getAichatCompletionMessage} from '../aichatCompletionApi';
import {
  ChatCompletionMessage,
  Role,
  AichatInteractionStatus as Status,
  AiCustomizations,
  ModelCardInfo,
  Visibility,
  LevelAichatSettings,
  ChatContext,
} from '../types';
import {RootState} from '@cdo/apps/types/redux';

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
}

const initialState: AichatState = {
  chatMessages: initialChatMessages,
  isWaitingForChatResponse: false,
  showWarningModal: true,
  chatMessageError: false,
  currentAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  savedAiCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  fieldVisibilities: DEFAULT_VISIBILITIES,
};

// THUNKS

// This thunk saves a student's AI customizations using the Project Manager (ie, to S3 typically),
// then does a comparison between the previous and current saved customizations in order to
// output a message to the chat window with the list of customizations that were updated.
export const updateAiCustomization = createAsyncThunk(
  'aichat/updateAiCustomization',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const {currentAiCustomizations, savedAiCustomizations} = state.aichat;

    // Remove any empty example topics on save
    const trimmedExampleTopics =
      currentAiCustomizations.modelCardInfo.exampleTopics.filter(
        topic => topic.length
      );
    thunkAPI.dispatch(
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

    thunkAPI.dispatch(setSavedAiCustomizations(trimmedCurrentAiCustomizations));

    const changedProperties = findChangedProperties(
      savedAiCustomizations,
      trimmedCurrentAiCustomizations
    );
    changedProperties.forEach(property => {
      thunkAPI.dispatch(
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
  }
);

// This thunk's callback function submits a user's chat content and AI customizations to
// the chat completion endpoint, then waits for a chat completion response, and updates
// the user messages.
export const submitChatContents = createAsyncThunk(
  'aichat/submitChatContents',
  async (chatContext: ChatContext, thunkAPI) => {
    const state = thunkAPI.getState() as {lab: LabState; aichat: AichatState};
    const aiCustomizations = state.aichat.savedAiCustomizations;
    const storedMessages = state.aichat.chatMessages;
    const newMessageId =
      storedMessages.length === 0
        ? 1
        : storedMessages[storedMessages.length - 1].id + 1;

    // Create the new user ChatCompleteMessage and add to chatMessages.
    const newMessage: ChatCompletionMessage = {
      id: newMessageId,
      role: Role.USER,
      status: Status.OK,
      chatMessageText: chatContext.userMessage,
      timestamp: getCurrentTimestamp(),
    };
    thunkAPI.dispatch(addChatMessage(newMessage));

    // Post user content and messages to backend and retrieve assistant response.
    const chatApiResponse = await getAichatCompletionMessage(
      aiCustomizations,
      storedMessages,
      chatContext
    );
    console.log('chatApiResponse', chatApiResponse);
    if (chatApiResponse?.role === Role.ASSISTANT) {
      const assistantChatMessage: ChatCompletionMessage = {
        id: newMessageId + 1,
        role: Role.ASSISTANT,
        status: Status.OK,
        chatMessageText: chatApiResponse.content,
        // The accuracy of this timestamp is debatable since it's not when our backend
        // issued the message, but it's good enough for user testing.
        timestamp: getCurrentTimestamp(),
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
      const newMessageId =
        state.chatMessages[state.chatMessages.length - 1].id + 1;
      const newMessage = {
        ...action.payload,
        id: newMessageId,
      };
      state.chatMessages.push(newMessage);
    },
    removeChatMessage: (state, action: PayloadAction<number>) => {
      const updatedMessages = state.chatMessages.filter(
        message => message.id !== action.payload
      );
      if (updatedMessages.length !== state.chatMessages.length) {
        state.chatMessages = updatedMessages;
      }
    },
    clearChatMessages: state => {
      state.chatMessages = initialChatMessages;
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

registerReducers({aichat: aichatSlice.reducer});
export const {
  addChatMessage,
  removeChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
  setShowWarningModal,
  updateChatMessageStatus,
  setStartingAiCustomizations,
  setSavedAiCustomizations,
  setAiCustomizationProperty,
  setModelCardProperty,
} = aichatSlice.actions;
