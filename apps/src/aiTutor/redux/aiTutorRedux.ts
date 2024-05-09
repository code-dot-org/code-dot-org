import _ from 'lodash';
import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {savePromptAndResponse} from '../interactionsApi';
import {
  Role,
  AITutorInteractionStatus as Status,
  ChatCompletionMessage,
  Level,
  ChatContext,
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

export interface InstructionsState {
  longInstructions: string;
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
  chatMessageError: false,
};

const enhanceInputForAITutor = (
  levelInstructions: string,
  chatContext: ChatContext
) => {
  const separator = '\n\n---\n\n';
  // TODO: Remove instructions for code compilation errors?
  const instructionsFormatted = `'Here are my instructions for this level:\n${levelInstructions}\n\n`;
  if (chatContext.actionType === AITutorTypes.GENERAL_CHAT) {
    // For general questions, only prepend level instructions
    return `${instructionsFormatted}${separator}${chatContext.studentInput}`;
  }

  const codePrefix = 'Here is the student’s code:\n\n```';
  const codePostfix = '```\n\n';
  const studentCodeFormatted = `${codePrefix}${chatContext.studentCode}${codePostfix}`;

  // For compilation and validation, prepend level instructions and student code
  return `${instructionsFormatted}${chatContext.studentInput}${separator}${studentCodeFormatted}`;
};

// THUNKS
export const askAITutor = createAsyncThunk(
  'aitutor/askAITutor',
  async (chatContext: ChatContext, thunkAPI) => {
    const state = thunkAPI.getState();
    const aiTutorState = state as {aiTutor: AITutorState};
    const instructionsState = state as {instructions: InstructionsState};
    const levelContext = {
      levelId: aiTutorState.aiTutor.level?.id,
      isProjectBacked: aiTutorState.aiTutor.level?.isProjectBacked,
      scriptId: aiTutorState.aiTutor.scriptId,
    };

    const levelInstructions = instructionsState.instructions.longInstructions;

    const storedMessages = aiTutorState.aiTutor.chatMessages;
    const newMessage: ChatCompletionMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: chatContext.studentInput,
    };
    thunkAPI.dispatch(addChatMessage(newMessage));

    const input = enhanceInputForAITutor(levelInstructions, chatContext);
    const chatApiResponse = await getChatCompletionMessage(
      input,
      storedMessages,
      levelContext.levelId,
      chatContext.actionType
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
} = aiTutorSlice.actions;
