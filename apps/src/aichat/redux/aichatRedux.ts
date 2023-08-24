import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  ChatCompletionMessage,
  AichatLevelProperties,
  Status,
  Role,
} from '../types';
import {initialChatMessages} from '../constants';

const registerReducers = require('@cdo/apps/redux').registerReducers;
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {getChatCompletionMessage} from '../chatApi';

export interface AichatState {
  // All user and assistant chat messages - includes too personal and inappropriate user messages.
  // Messages will be logged and stored.
  chatMessages: ChatCompletionMessage[];
  // Denotes whether we are waiting for a chat completion response from the backend
  isWaitingForChatResponse: boolean;
  // Denotes whether we should show the warning modal
  showWarningModal: boolean;
}

const initialState: AichatState = {
  chatMessages: initialChatMessages,
  isWaitingForChatResponse: false,
  showWarningModal: true,
};

// THUNKS
export const submitChatMessage = createAsyncThunk(
  'aichat/submitChatMessage',
  async (message: string, thunkAPI) => {
    thunkAPI.dispatch(setIsWaitingForChatResponse(true));
    const state = thunkAPI.getState() as {lab: LabState; aichat: AichatState};
    const systemPrompt = (state.lab.levelProperties as AichatLevelProperties)
      ?.systemPrompt;
    // check for undefined systemPrompt
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
    // Send user message to backend and retrieve assistant response.
    // create the newChatCompleteMessage
    // Add to chatMessages
    const newMessage: ChatCompletionMessage = {
      id: newMessageId,
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: message,
    };
    thunkAPI.dispatch(addChatMessage(newMessage));

    const chatApiResponse = await getChatCompletionMessage(
      systemPrompt,
      newMessageId,
      message,
      appropriateChatMessages
    );
    thunkAPI.dispatch(setIsWaitingForChatResponse(false));

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
      console.log(state.chatMessages);
      const {id, status} = action.payload;
      const chatMessage = state.chatMessages.find(msg => msg.id === id);
      if (chatMessage) {
        chatMessage.status = status;
      }
    },
  },
});

registerReducers({aichat: aichatSlice.reducer});
export const {
  addChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
  setShowWarningModal,
  updateChatMessageStatus,
} = aichatSlice.actions;
