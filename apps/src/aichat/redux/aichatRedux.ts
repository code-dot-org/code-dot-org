import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatCompletionMessage} from '../types';
import {initialChatMessages} from '../constants';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AichatState {
  // All user and assistant chat messages - includes too personal and inappropriate user messages.
  // Messages will be logged and stored.
  chatMessages: ChatCompletionMessage[];
  // New user message that is submitted via the user chat message editor.
  newUserMessage: string;
  // Denotes whether we are waiting for a chat completion response from the backend
  isWaitingForChatResponse: boolean;
  // Denotes whether we should show the warning modal
  showWarningModal: boolean;
}

const initialState: AichatState = {
  newUserMessage: '',
  chatMessages: initialChatMessages,
  isWaitingForChatResponse: false,
  showWarningModal: true,
};

const aichatSlice = createSlice({
  name: 'aichat',
  initialState,
  reducers: {
    setNewUserMessage: (state, action: PayloadAction<string>) => {
      state.newUserMessage = action.payload;
    },
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
  },
});

registerReducers({aichat: aichatSlice.reducer});
export const {
  setNewUserMessage,
  addChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
  setShowWarningModal,
} = aichatSlice.actions;
