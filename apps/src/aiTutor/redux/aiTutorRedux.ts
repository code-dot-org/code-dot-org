import {getChatCompletionMessage} from '@cdo/apps/aichat/chatApi';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  compilationSystemPrompt,
  generalChatSystemPrompt,
  validationSystemPrompt,
} from '@cdo/apps/aiTutor/constants';
import {savePromptAndResponse} from '../interactionsApi';
import {
  Role,
  AITutorInteractionStatus as Status,
  ChatCompletionMessage,
  Level,
  ChatContext,
  AITutorTypesValue,
  AITutorTypes as TutorTypes,
  AITutorInteractionStatusValue,
} from '../types';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AITutorState {
  selectedTutorType: AITutorTypesValue | undefined;
  level: Level | undefined;
  scriptId: number | undefined;
  aiResponse: string | undefined;
  chatMessages: ChatCompletionMessage[];
  isWaitingForChatResponse: boolean;
  chatMessageError: boolean;
}

const initialChatMessages: ChatCompletionMessage[] = [
  {
    id: 0,
    role: Role.ASSISTANT,
    chatMessageText: "Hi! I'm your AI Tutor.",
    status: Status.OK,
  },
];

const initialState: AITutorState = {
  selectedTutorType: undefined,
  level: undefined,
  scriptId: undefined,
  aiResponse: '',
  chatMessages: initialChatMessages,
  isWaitingForChatResponse: false,
  chatMessageError: false,
};

// THUNKS
export const askAITutor = createAsyncThunk(
  'aitutor/askAITutor',
  async (chatContext: ChatContext, thunkAPI) => {
    const state = thunkAPI.getState() as {aiTutor: AITutorState};
    const levelContext = {
      levelId: state.aiTutor.level?.id,
      isProjectBacked: state.aiTutor.level?.isProjectBacked,
      scriptId: state.aiTutor.scriptId,
    };

    const tutorType = chatContext.tutorType;
    const generalChat = tutorType === TutorTypes.GENERAL_CHAT;
    const compilation = tutorType === TutorTypes.COMPILATION;
    const validation = tutorType === TutorTypes.VALIDATION;

    let systemPrompt;
    if (validation) {
      systemPrompt = validationSystemPrompt;
    } else if (compilation) {
      systemPrompt = compilationSystemPrompt;
    } else {
      systemPrompt = generalChatSystemPrompt;
    }

    const storedMessages = state.aiTutor.chatMessages;

    const newMessageId = storedMessages[storedMessages.length - 1].id + 1;

    if (generalChat) {
      const newMessage: ChatCompletionMessage = {
        id: newMessageId,
        role: Role.USER,
        status: Status.UNKNOWN,
        chatMessageText: chatContext.studentInput,
      };
      thunkAPI.dispatch(addChatMessage(newMessage));
    }

    const chatApiResponse = await getChatCompletionMessage(
      systemPrompt,
      newMessageId,
      chatContext.studentInput,
      storedMessages,
      levelContext.levelId,
      chatContext.tutorType
    );

    thunkAPI.dispatch(
      updateChatMessageStatus({
        id: chatApiResponse.id,
        status: chatApiResponse.status,
      })
    );

    if (chatApiResponse.assistantResponse) {
      const assistantChatMessage: ChatCompletionMessage = {
        id: newMessageId,
        role: Role.ASSISTANT,
        status: Status.OK,
        chatMessageText: chatApiResponse.assistantResponse,
      };
      thunkAPI.dispatch(addChatMessage(assistantChatMessage));
    }

    const interactionData = {
      ...levelContext,
      type: chatContext.tutorType,
      prompt: JSON.stringify(chatContext.studentInput),
      status: chatApiResponse?.status,
      aiResponse: chatApiResponse?.assistantResponse,
    };

    await savePromptAndResponse(interactionData);
  }
);

const aiTutorSlice = createSlice({
  name: 'aiTutor',
  initialState,
  reducers: {
    setSelectedTutorType: (
      state,
      action: PayloadAction<AITutorTypesValue | undefined>
    ) => {
      state.selectedTutorType = action.payload;
    },
    addAIResponse: (state, action: PayloadAction<string | undefined>) => {
      state.aiResponse = action.payload;
    },
    setLevel: (state, action: PayloadAction<Level | undefined>) => {
      state.level = action.payload;
    },
    setScriptId: (state, action: PayloadAction<number | undefined>) => {
      state.scriptId = action.payload;
    },
    addChatMessage: (state, action: PayloadAction<ChatCompletionMessage>) => {
      const newMessageId =
        state.chatMessages[state.chatMessages.length - 1].id + 1;
      const newMessage = {
        ...action.payload,
        id: newMessageId,
      };
      state.chatMessages.push(newMessage);
    },
    clearChatMessages: state => {
      state.chatMessages = initialChatMessages;
    },
    setIsWaitingForChatResponse: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForChatResponse = action.payload;
    },
    updateChatMessageStatus: (
      state,
      action: PayloadAction<{id: number; status: AITutorInteractionStatusValue}>
    ) => {
      const {id, status} = action.payload;
      const chatMessage = state.chatMessages.find(msg => msg.id === id);
      if (chatMessage) {
        chatMessage.status = status;
      }
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
  setSelectedTutorType,
  setLevel,
  setScriptId,
  addAIResponse,
  addChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
  updateChatMessageStatus,
} = aiTutorSlice.actions;
