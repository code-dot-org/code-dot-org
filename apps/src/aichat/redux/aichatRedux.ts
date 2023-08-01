// Redux store for managing chat history with OpenAI on our AI Chat levels.
import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export interface ChatMessage {
  content: string;
  role: 'system' | 'user' | 'assistant' | 'function';
}

interface AichatState {
  chatMessages: ChatMessage[];
}

const initialState: AichatState = {
  chatMessages: [],
};

const aichatSlice = createSlice({
  name: 'aichat',
  initialState,
  reducers: {
    appendSystemPrompt(state, action: PayloadAction<string>) {
      state.chatMessages.push({role: 'system', content: action.payload});
    },
    appendBotMessage(state, action: PayloadAction<string>) {
      state.chatMessages.push({role: 'assistant', content: action.payload});
    },
    appendUserMessage(state, action: PayloadAction<string>) {
      state.chatMessages.push({role: 'user', content: action.payload});
    },
  },
});

export const {appendSystemPrompt, appendBotMessage, appendUserMessage} =
  aichatSlice.actions;

export default aichatSlice.reducer;
