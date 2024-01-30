import {
  getChatCompletionMessage,
  postOpenaiChatCompletion,
} from '@cdo/apps/aichat/chatApi';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {generalChatSystemPrompt} from '@cdo/apps/aiTutor/constants';
import {savePromptAndResponse} from '../interactionsApi';
import {TutorTypes, Role, Status, ChatCompletionMessage} from '../types';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AITutorState {
  // State for compilation and validation.
  aiResponse: string | undefined;
  isWaitingForAIResponse: boolean;
  // State for general chat.
  chatMessages: ChatCompletionMessage[];
  isWaitingForChatResponse: boolean;
  chatMessageError: boolean;
}

const initialChatMessages: ChatCompletionMessage[] = [
  {
    id: 0,
    role: Role.ASSISTANT,
    chatMessageText: "Hi! I'm your AI Tutor. Type your question below.",
    status: Status.OK,
  },
];

const initialState: AITutorState = {
  aiResponse: '',
  isWaitingForAIResponse: false,
  chatMessages: initialChatMessages,
  isWaitingForChatResponse: false,
  chatMessageError: false,
};

interface ChatContext {
  levelId?: number;
  systemPrompt: string;
  studentCode: string;
  tutorType: TutorTypes;
}

// THUNKS

// Compilation & Validation
export const askAITutor = createAsyncThunk(
  'aitutor/askAITutor',
  async (ChatContext: ChatContext, thunkAPI) => {
    if (ChatContext.systemPrompt === undefined) {
      throw new Error('systemPrompt is undefined');
    }

    if (ChatContext.studentCode === undefined) {
      throw new Error('studentCode is undefined');
    }

    const chatApiResponse = await postOpenaiChatCompletion(
      [
        {role: Role.SYSTEM, content: ChatContext.systemPrompt},
        {role: Role.USER, content: ChatContext.studentCode},
      ],
      ChatContext.levelId
    );

    thunkAPI.dispatch(addAIResponse(chatApiResponse?.content));
    const prompt = ChatContext.systemPrompt + ChatContext.studentCode;

    const interactionData = {
      userId: 123456789,
      levelId: ChatContext.levelId,
      scriptId: 123,
      type: ChatContext.tutorType,
      prompt: prompt,
      status: chatApiResponse?.status,
      aiResponse: chatApiResponse?.content,
    };

    console.log('interactionData', interactionData);
    savePromptAndResponse(interactionData);
  }
);

// General Chat
// This thunk's callback function submits a user chat message to the chat completion endpoint,
// waits for a chat completion response, and updates the user message state.
export const submitChatMessage = createAsyncThunk(
  'aitutor/submitChatMessage',
  async (message: string, thunkAPI) => {
    const state = thunkAPI.getState() as {aiTutor: AITutorState};
    const systemPrompt = generalChatSystemPrompt;
    const storedMessages = state.aiTutor.chatMessages;
    const newMessageId = storedMessages[storedMessages.length - 1].id + 1;

    // Create the new user ChatCompleteMessage and add to chatMessages.
    const newMessage: ChatCompletionMessage = {
      id: newMessageId,
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: message,
    };
    thunkAPI.dispatch(addChatMessage(newMessage));

    // Send user message to backend and retrieve assistant response.
    const chatApiResponse = await getChatCompletionMessage(
      systemPrompt,
      newMessageId,
      message,
      storedMessages
    );

    // Find message in chatMessages and update status.
    thunkAPI.dispatch(
      updateChatMessageStatus({
        id: chatApiResponse.id,
        status: chatApiResponse.status,
      })
    );

    // Add assistant chat messages to chatMessages.
    if (chatApiResponse.assistantResponse) {
      const assistantChatMessage: ChatCompletionMessage = {
        id: chatApiResponse.id + 1,
        role: Role.ASSISTANT,
        status: Status.OK,
        chatMessageText: chatApiResponse.assistantResponse,
      };
      thunkAPI.dispatch(addChatMessage(assistantChatMessage));
    }
  }
);

const aiTutorSlice = createSlice({
  name: 'aiTutor',
  initialState,
  reducers: {
    addAIResponse: (state, action: PayloadAction<string | undefined>) => {
      state.aiResponse = action.payload;
    },
    setIsWaitingForAIResponse: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForAIResponse = action.payload;
    },
    addChatMessage: (state, action: PayloadAction<ChatCompletionMessage>) => {
      state.chatMessages.push(action.payload);
    },
    clearChatMessages: state => {
      state.chatMessages = initialChatMessages;
    },
    setIsWaitingForChatResponse: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForChatResponse = action.payload;
    },
    updateChatMessageStatus: (
      state,
      action: PayloadAction<{id: number; status: Status}>
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
      state.isWaitingForAIResponse = false;
    });
    builder.addCase(askAITutor.rejected, (state, action) => {
      state.isWaitingForAIResponse = false;
      console.error(action.error);
    });
    builder.addCase(askAITutor.pending, state => {
      state.isWaitingForAIResponse = true;
    });
    builder.addCase(submitChatMessage.fulfilled, state => {
      state.isWaitingForChatResponse = false;
    });
    builder.addCase(submitChatMessage.rejected, (state, action) => {
      state.isWaitingForChatResponse = false;
      state.chatMessageError = true;
      console.error(action.error);
    });
    builder.addCase(submitChatMessage.pending, state => {
      state.isWaitingForChatResponse = true;
    });
  },
});

registerReducers({aiTutor: aiTutorSlice.reducer});
export const {
  addAIResponse,
  addChatMessage,
  clearChatMessages,
  setIsWaitingForChatResponse,
  updateChatMessageStatus,
} = aiTutorSlice.actions;
