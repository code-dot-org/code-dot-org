import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

import {
  DEFAULT_THREAD_TITLE,
  ThreadTypeFields,
  THREAD_TYPES,
} from '../constants';
import {SUGGESTED_PROMPTS_FOR_SELECTION} from '../predefinedPrompts';
import {AiArtifact, ChatItem, ChatPrompt, ChatTextMessage} from '../types';

import {AiDiffChatState} from './state';

const initialState: AiDiffChatState = {
  chatIsOpen: false,
  threadId: 0,
  threadTitle: DEFAULT_THREAD_TITLE,
  threadType: THREAD_TYPES.default,
  initialThreadPrompt: null,
  selectedPrompt: null,
  threadMessages: [],
  threadKeyId: 0,
  initialChatMessage: SUGGESTED_PROMPTS_FOR_SELECTION['default'].initialMessage,
  artifact: undefined,
  artifactType: undefined,
  pendingArtifactMessage: undefined,
};

const aiDiffChatSlice = createSlice({
  name: 'aiDiffChat',
  initialState,
  reducers: {
    setChatIsOpen: (state, action: PayloadAction<boolean>) => {
      state.chatIsOpen = action.payload;
    },
    setThreadId(state, action: PayloadAction<number>) {
      state.threadId = action.payload;
    },
    setThreadTitle(state, action: PayloadAction<string>) {
      state.threadTitle = action.payload;
    },
    setThreadType(state, action: PayloadAction<ThreadTypeFields>) {
      state.threadType = action.payload;
    },
    setInitialThreadPrompt(state, action: PayloadAction<ChatPrompt | null>) {
      state.initialThreadPrompt = action.payload;
    },
    setSelectedPrompt(state, action: PayloadAction<ChatPrompt | null>) {
      state.selectedPrompt = action.payload;
    },
    setThreadMessages(state, action: PayloadAction<ChatItem[]>) {
      state.threadMessages = action.payload;
    },
    addThreadMessage: (state, action: PayloadAction<ChatItem>) => {
      state.threadMessages.push(action.payload);
    },
    setThreadKeyId(state, action: PayloadAction<number>) {
      state.threadKeyId = action.payload;
    },
    setArtifact(state, action: PayloadAction<AiArtifact | undefined>) {
      state.artifact = action.payload;
    },
    setInitialChatMessage(state, action: PayloadAction<string>) {
      state.initialChatMessage = action.payload;
    },
    setArtifactType(state, action: PayloadAction<string | undefined>) {
      state.artifactType = action.payload;
    },
    setPendingArtifactMessage(state, action: PayloadAction<ChatTextMessage>) {
      state.pendingArtifactMessage = action.payload;
    },
    clearPendingArtifactMessage: state => {
      state.pendingArtifactMessage = undefined;
    },
  },
});

registerReducers({aiDiffChat: aiDiffChatSlice.reducer});

export const aiDiffChatReducer = aiDiffChatSlice.reducer;

export const {
  setChatIsOpen,
  setThreadId,
  setThreadTitle,
  setThreadType,
  setInitialThreadPrompt,
  setSelectedPrompt,
  setThreadMessages,
  addThreadMessage,
  setThreadKeyId,
  setArtifact,
  setInitialChatMessage,
  setArtifactType,
  setPendingArtifactMessage,
  clearPendingArtifactMessage,
} = aiDiffChatSlice.actions;
