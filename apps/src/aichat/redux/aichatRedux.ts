import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatCompletionMessage} from '../types';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AichatState {
  chatMessages: ChatCompletionMessage[];
  isWaitingForChatResponse: boolean;
  showWarningModal: boolean;
}

const initialState: AichatState = {
  chatMessages: [],
  isWaitingForChatResponse: false,
  showWarningModal: false,
};

const aichatSlice = createSlice({
  name: 'aichat',
  initialState,
  reducers: {
    addChatMessage: (state, action: PayloadAction<ChatCompletionMessage>) => {
      state.chatMessages.push(action.payload);
    },
    clearChatMessages: state => {
      state.chatMessages = [];
    },
    setIsWaitingForChatResponse: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForChatResponse = action.payload;
    },
    setShowWarningModal: (state, action: PayloadAction<boolean>) => {
      state.showWarningModal = action.payload;
    },
  },
});

// TODO: If/when a top-level component is created that wraps {@link AichatView}, then
// registering reducers should happen there. We are registering reducers here for now
// because MusicView is currently the top-level entrypoint into Music Lab and also needs
// to be connected to this state.
registerReducers({aichat: aichatSlice.reducer});
export const {
  addChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
  setShowWarningModal,
} = aichatSlice.actions;
