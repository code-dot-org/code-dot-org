import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatCompletionMessage} from '../types';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AichatState {
  chatMessages: ChatCompletionMessage[];
  newUserMessage: string;
  isWaitingForChatResponse: boolean;
}

const initialState: AichatState = {
  newUserMessage: '',
  chatMessages: [],
  isWaitingForChatResponse: false,
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
      state.chatMessages = [];
    },
    setIsWaitingForChatResponse: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForChatResponse = action.payload;
    },
  },
});

// TODO: If/when a top-level component is created that wraps {@link AichatView}, then
// registering reducers should happen there. We are registering reducers here for now
// because MusicView is currently the top-level entrypoint into Music Lab and also needs
// to be connected to this state.
registerReducers({aichat: aichatSlice.reducer});
export const {
  setNewUserMessage,
  addChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
} = aichatSlice.actions;
