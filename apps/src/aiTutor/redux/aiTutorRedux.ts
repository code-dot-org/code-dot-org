import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import _ from 'lodash';

import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';

import {savePromptAndResponse} from '../interactionsApi';
import {
  Role,
  AITutorInteractionStatus as Status,
  ChatCompletionMessage,
  Level,
  ChatContext,
} from '../types';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AITutorState {
  level: Level | undefined;
  scriptId: number | undefined;
  aiResponse: string | undefined;
  chatMessages: ChatCompletionMessage[];
  isWaitingForChatResponse: boolean;
  isChatOpen: boolean;
}

const initialChatMessages: ChatCompletionMessage[] = [
  {
    role: Role.ASSISTANT,
    chatMessageText: "Hi! I'm your AI Tutor.",
    status: Status.OK,
  },
];

const initialState: AITutorState = {
  level: undefined,
  scriptId: undefined,
  aiResponse: '',
  chatMessages: initialChatMessages,
  isWaitingForChatResponse: false,
  isChatOpen: false,
};

export const formatQuestionForAITutor = (chatContext: ChatContext) => {
  let formattedQuestion = chatContext.studentInput;

  if (chatContext.studentCode) {
    const separator = '\n\n---\n\n';
    const codePrefix = "Here is the student's code:\n\n```\n";
    const codePostfix = '\n```';
    formattedQuestion = `${chatContext.studentInput}${separator}${codePrefix}${chatContext.studentCode}${codePostfix}`;
  }

  return formattedQuestion;
};

// THUNKS
export const askAITutor = createAsyncThunk(
  'aitutor/askAITutor',
  async (chatContext: ChatContext, thunkAPI) => {
    const state = thunkAPI.getState();
    const aiTutorState = state as {aiTutor: AITutorState};
    const levelContext = {
      levelId: aiTutorState.aiTutor.level?.id,
      scriptId: aiTutorState.aiTutor.scriptId,
    };

    const storedMessages = aiTutorState.aiTutor.chatMessages;
    const newMessage: ChatCompletionMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: chatContext.studentInput,
    };
    thunkAPI.dispatch(addChatMessage(newMessage));

    const formattedQuestion = formatQuestionForAITutor(chatContext);
    // We currently use the default system prompt stored on the server,
    // so don't pass in an override here.
    const systemPrompt = undefined;
    const chatApiResponse = await getChatCompletionMessage(
      formattedQuestion,
      storedMessages,
      systemPrompt,
      levelContext.levelId,
      levelContext.scriptId
    );
    thunkAPI.dispatch(
      updateLastChatMessage({
        status: chatApiResponse.status,
      })
    );

    if (chatApiResponse.assistantResponse) {
      const assistantChatMessage: ChatCompletionMessage = {
        role: Role.ASSISTANT,
        status: chatApiResponse.status,
        chatMessageText: chatApiResponse.assistantResponse,
      };
      thunkAPI.dispatch(addChatMessage(assistantChatMessage));
    }

    const interactionData = {
      ...levelContext,
      type: chatContext.actionType,
      prompt: JSON.stringify(chatContext.studentInput),
      status: chatApiResponse?.status,
      aiResponse: chatApiResponse?.assistantResponse,
    };

    const savedInteraction = await savePromptAndResponse(interactionData);
    thunkAPI.dispatch(updateLastChatMessage({id: savedInteraction.id}));
  }
);

const aiTutorSlice = createSlice({
  name: 'aiTutor',
  initialState,
  reducers: {
    addAIResponse: (state, action: PayloadAction<string | undefined>) => {
      state.aiResponse = action.payload;
    },
    setLevel: (state, action: PayloadAction<Level | undefined>) => {
      state.level = action.payload;
    },
    setScriptId: (state, action: PayloadAction<number | undefined>) => {
      state.scriptId = action.payload;
    },
    addChatMessage: (
      state,
      {payload}: PayloadAction<ChatCompletionMessage>
    ) => {
      state.chatMessages.push(payload);
    },
    clearChatMessages: state => {
      state.chatMessages = initialChatMessages;
    },
    setIsWaitingForChatResponse: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForChatResponse = action.payload;
    },
    updateLastChatMessage: (
      state,
      action: PayloadAction<Partial<ChatCompletionMessage>>
    ) => {
      if (state.chatMessages.length > 0) {
        const index = state.chatMessages.length - 1;
        const lastMessage = state.chatMessages[index];
        state.chatMessages[index] = _.merge({}, lastMessage, action.payload);
      }
    },
    setIsChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isChatOpen = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(askAITutor.fulfilled, state => {
      state.isWaitingForChatResponse = false;
    });
    builder.addCase(askAITutor.rejected, (state, action) => {
      state.isWaitingForChatResponse = false;
      console.error(action.error);
    });
    builder.addCase(askAITutor.pending, state => {
      state.isWaitingForChatResponse = true;
    });
  },
});

registerReducers({aiTutor: aiTutorSlice.reducer});
export const {
  setLevel,
  setScriptId,
  addAIResponse,
  addChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
  updateLastChatMessage,
  setIsChatOpen,
} = aiTutorSlice.actions;
