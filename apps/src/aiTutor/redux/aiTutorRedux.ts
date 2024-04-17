import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {systemPrompt as baseSystemPrompt} from '@cdo/apps/aiTutor/constants';
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

const formatQuestionForAITutor = (chatContext: ChatContext) => {
  if (chatContext.actionType === AITutorTypes.GENERAL_CHAT) {
    return chatContext.studentInput;
  }

  const separator = '\n\n---\n\n';
  const codePrefix = "Here is the student's code:\n\n```\n";
  const codePostfix = '\n```';

  const formattedQuestion = `${chatContext.studentInput}${separator}${codePrefix}${chatContext.studentCode}${codePostfix}`;
  return formattedQuestion;
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

    let systemPrompt = baseSystemPrompt;
    const levelInstructions = instructionsState.instructions.longInstructions;

    if (levelInstructions.length > 0) {
      systemPrompt +=
        '\n Here are the student instructions for this level: ' +
        levelInstructions;
    }

    const storedMessages = aiTutorState.aiTutor.chatMessages;
    const newMessage: ChatCompletionMessage = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: chatContext.studentInput,
    };
    console.log('newMessage: ', newMessage);
    thunkAPI.dispatch(addChatMessage(newMessage));

    const formattedQuestion = formatQuestionForAITutor(chatContext);
    const chatApiResponse = await getChatCompletionMessage(
      systemPrompt,
      formattedQuestion,
      storedMessages,
      levelContext.levelId,
      chatContext.actionType
    );
    console.log('chatApiResponse: ', chatApiResponse);

    thunkAPI.dispatch(
      updateLastChatMessage({
        status: chatApiResponse.status,
      })
    );

    if (chatApiResponse.assistantResponse) {
      const assistantChatMessage: ChatCompletionMessage = {
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

    const savedMessage = await savePromptAndResponse(interactionData);
    console.log('savedMessage: ', savedMessage);
    thunkAPI.dispatch(updateLastChatMessage({id: savedMessage.id}));
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
        const lastMessage = state.chatMessages[state.chatMessages.length - 1];
        const payloadKeys = Object.keys(action.payload) as Array<
          keyof ChatCompletionMessage
        >;

        payloadKeys.forEach(key => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (lastMessage as any)[key] = action.payload[key];
        });
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
