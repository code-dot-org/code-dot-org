import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import _ from 'lodash';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';

import {initialAssistantGreeting} from '../constants';
import {savePromptAndResponse} from '../interactionsApi';
import {
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
  showSuggestedPrompts: boolean;
}

const initialChatMessages: ChatCompletionMessage[] = [
  {
    role: Role.ASSISTANT,
    chatMessageText: initialAssistantGreeting,
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
  showSuggestedPrompts: false,
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

const formatResponseForStudent = (response: string) => {
  const paritionedResponse = response.split(
    '[pedagogical-guiding-answer-markdown]'
  );
  const guidingResponse = paritionedResponse[paritionedResponse.length - 1];
  const studentFacingResponse = guidingResponse.split('[end-of-response]')[0];
  return studentFacingResponse;
};

// THUNKS
export const askAITutor = createAsyncThunk(
  'aitutor/askAITutor',
  async (chatContext: ChatContext, thunkAPI) => {
    thunkAPI.dispatch(setIsWaitingForChatResponse(true));
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
    const systemPrompt = !!chatContext.systemPrompt
      ? chatContext.systemPrompt
      : undefined;
    const chatApiResponse = await getChatCompletionMessage(
      formattedQuestion,
      storedMessages,
      systemPrompt,
      levelContext.levelId,
      levelContext.scriptId
    );
    thunkAPI.dispatch(setIsWaitingForChatResponse(false));
    thunkAPI.dispatch(
      updateLastChatMessage({
        status: chatApiResponse.status,
      })
    );

    if (chatApiResponse.assistantResponse) {
      const assistantChatMessage: ChatCompletionMessage = {
        role: Role.ASSISTANT,
        status: chatApiResponse.status,
        chatMessageText: formatResponseForStudent(
          chatApiResponse.assistantResponse
        ),
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
      if (state.level?.id !== action.payload?.id) {
        // Reset chat if the level changes (e.g. when switching levels without a page reload)
        state.chatMessages = initialChatMessages;
        state.isChatOpen = false;
      }
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
    setShowSuggestedPrompts: (state, action: PayloadAction<boolean>) => {
      state.showSuggestedPrompts = action.payload;
    },
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
  setShowSuggestedPrompts,
} = aiTutorSlice.actions;
