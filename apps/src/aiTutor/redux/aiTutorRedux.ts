import {postOpenaiChatCompletion} from '@cdo/apps/aichat/chatApi';
import {Role} from '@cdo/apps/aichat/types';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AITutorState {
  aiResponse: string | undefined;
  isWaitingForAIResponse: boolean;
}

const initialState: AITutorState = {
  aiResponse: '',
  isWaitingForAIResponse: false,
};

interface ChatContext {
  levelId?: number;
  systemPrompt: string;
  studentCode: string;
}

// THUNKS
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
  },
});

registerReducers({aiTutor: aiTutorSlice.reducer});
export const {addAIResponse} = aiTutorSlice.actions;
