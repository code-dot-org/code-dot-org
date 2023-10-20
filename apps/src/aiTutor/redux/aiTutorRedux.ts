import {postOpenaiChatCompletion} from '@cdo/apps/aichat/chatApi';
import {Role} from '@cdo/apps/aichat/types';
import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';

const registerReducers = require('@cdo/apps/redux').registerReducers;

export interface AiTutorState {
  aiResponse: string | undefined;
}

const initialState: AiTutorState = {
  aiResponse: '',
};

// THUNKS
export const askAITutor = createAsyncThunk(
  'aitutor/askAITutor',
  async (studentCode: string, thunkAPI) => {
    const systemPrompt =
      'You are a tutor in a high school computer science class. Students in the class are studying Java and they would like to know in age-appropriate, clear language why their code does not compile.';

    if (systemPrompt === undefined) {
      throw new Error('systemPrompt is undefined');
    }

    if (studentCode === undefined) {
      throw new Error('studentCode is undefined');
    }

    const chatApiResponse = await postOpenaiChatCompletion([
      {role: Role.SYSTEM, content: systemPrompt},
      {role: Role.USER, content: studentCode},
    ]);
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
  },
});

registerReducers({aiTutor: aiTutorSlice.reducer});
export const {addAIResponse} = aiTutorSlice.actions;
