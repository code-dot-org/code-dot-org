import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {systemPrompt} from '@cdo/apps/aiTutor/constants';
import {savePromptAndResponse} from '../interactionsApi';
import {
  Role,
  AITutorInteractionStatus as Status,
  ChatCompletionMessage,
  Level,
  ChatContext,
  AITutorInteractionStatusValue,
  AITutorTypes,
} from '../types';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AITutorState {
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
  level: undefined,
  scriptId: undefined,
  aiResponse: '',
  chatMessages: initialChatMessages,
  isWaitingForChatResponse: false,
  chatMessageError: false,
};

const formatQuestionForAITutor = (chatContext: ChatContext) => {
  if (chatContext.actionType === AITutorTypes.GENERAL_CHAT) {
    return chatContext.studentInput;
  }

  const separator = '\n\n---\n\n';
  const codePrefix = "Here is the student's code:\n\n```\n";
  const codePostfix = '\n```';
  // Construct the formatted question
  const formattedQuestion = `${chatContext.studentInput}${separator}${codePrefix}${chatContext.studentCode}${codePostfix}`;

  return formattedQuestion;
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

    const storedMessages = state.aiTutor.chatMessages;

    const newMessageId = storedMessages[storedMessages.length - 1].id + 1;

    const newMessage: ChatCompletionMessage = {
      id: newMessageId,
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: chatContext.studentInput,
    };
    thunkAPI.dispatch(addChatMessage(newMessage));

    const formattedQuestion = formatQuestionForAITutor(chatContext);
    const chatApiResponse = await getChatCompletionMessage(
      systemPrompt,
      newMessageId,
      formattedQuestion,
      storedMessages,
      levelContext.levelId,
      chatContext.actionType
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
      type: chatContext.actionType,
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
  setLevel,
  setScriptId,
  addAIResponse,
  addChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
  updateChatMessageStatus,
} = aiTutorSlice.actions;
