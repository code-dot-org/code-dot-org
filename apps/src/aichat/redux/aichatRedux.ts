import moment from 'moment';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
const registerReducers = require('@cdo/apps/redux').registerReducers;

import {EMPTY_AI_CUSTOMIZATIONS_STUDENT} from '../views/modelCustomization/constants';
import {initialChatMessages} from '../constants';
import {getChatCompletionMessage} from '../chatApi';
import {
  ChatCompletionMessage,
  AichatLevelProperties,
  Role,
  Status,
  AiCustomizations,
  ModelCardInfo,
} from '../types';

const getCurrentTimestamp = () => moment(Date.now()).format('YYYY-MM-DD HH:mm');
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
}

const initialState: AichatState = {
  chatMessages: initialChatMessages,
  isWaitingForChatResponse: false,
  showWarningModal: true,
  chatMessageError: false,
  currentAiCustomizations: EMPTY_AI_CUSTOMIZATIONS_STUDENT,
};

// THUNKS

// This thunk's callback function submits a user chat message to the chat completion endpoint,
// waits for a chat completion response, and updates the user message state.
export const submitChatMessage = createAsyncThunk(
  'aichat/submitChatMessage',
  async (message: string, thunkAPI) => {
    const state = thunkAPI.getState() as {lab: LabState; aichat: AichatState};
    const systemPrompt = (state.lab.levelProperties as AichatLevelProperties)
      ?.systemPrompt;
    // TODO: move a check for undefined systemPrompt to AIchatView and throw an error dialog
    // there if systemPrompt is undefined.
    if (systemPrompt === undefined) {
      throw new Error('systemPrompt is undefined');
    }
    const storedMessages = state.aichat.chatMessages;
    const newMessageId =
      storedMessages.length === 0
        ? 1
        : storedMessages[storedMessages.length - 1].id + 1;
    const appropriateChatMessages = storedMessages.filter(
      msg => msg.status === Status.OK
    );

    // Create the new user ChatCompleteMessage and add to chatMessages.
    const newMessage: ChatCompletionMessage = {
      id: newMessageId,
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: message,
      timestamp: getCurrentTimestamp(),
    };
    thunkAPI.dispatch(addChatMessage(newMessage));

    // Send user message to backend and retrieve assistant response.
    const chatApiResponse = await getChatCompletionMessage(
      systemPrompt,
      newMessageId,
      message,
      appropriateChatMessages
    );

    // Find message in chatMessages and update status.
    thunkAPI.dispatch(
      updateChatMessageStatus({
        id: chatApiResponse.id,
        status: chatApiResponse.status,
      })
    );

    // Add assistant chat messages to chatMessages.
    if (chatApiResponse.assistantResponse) {
      const assistantChatMessage: ChatCompletionMessage = {
        id: chatApiResponse.id + 1,
        role: Role.ASSISTANT,
        status: Status.OK,
        chatMessageText: chatApiResponse.assistantResponse,
        // The accuracy of this timestamp is debatable since it's not when our backend
        // issued the message, but it's good enough for user testing.
        timestamp: getCurrentTimestamp(),
      };
      thunkAPI.dispatch(addChatMessage(assistantChatMessage));
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
    setAiCustomizations: (state, action: PayloadAction<AiCustomizations>) => {
      state.currentAiCustomizations = action.payload;
    },
    setAiCustomizationProperty: (
      state,
      action: PayloadAction<{
        property: keyof AiCustomizations;
        value: AiCustomizations[typeof property];
      }>
    ) => {
      const {property, value} = action.payload;
      state.currentAiCustomizations[property] = value;
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
    builder.addCase(submitChatMessage.fulfilled, state => {
      state.isWaitingForChatResponse = false;
    });
    builder.addCase(submitChatMessage.rejected, (state, action) => {
      state.isWaitingForChatResponse = false;
      state.chatMessageError = true;
      console.error(action.error);
    });
    builder.addCase(submitChatMessage.pending, state => {
      state.isWaitingForChatResponse = true;
    });
  },
});

registerReducers({aichat: aichatSlice.reducer});
export const {
  addChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
  setShowWarningModal,
  updateChatMessageStatus,
  setAiCustomizations,
  setAiCustomizationProperty,
  setModelCardProperty,
} = aichatSlice.actions;
