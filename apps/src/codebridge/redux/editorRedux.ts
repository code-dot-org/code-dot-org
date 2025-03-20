import {ErrorDetails} from '@codebridge/types';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CodebridgeWorkspaceState {
  codeErrors: ErrorDetails[];
}

export const initialState: CodebridgeWorkspaceState = {
  codeErrors: [],
};

// SLICE
const workspaceSlice = createSlice({
  name: 'codebridgeEditor',
  initialState,
  reducers: {
    addCodeError(state, action: PayloadAction<ErrorDetails>) {
      state.codeErrors.push(action.payload);
    },
    clearCodeErrors(state) {
      state.codeErrors = [];
    },
  },
});

export const {addCodeError, clearCodeErrors} = workspaceSlice.actions;

export default workspaceSlice.reducer;
