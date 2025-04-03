import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CodebridgeWorkspaceState {
  showLockedFilesBanner: boolean;
}

export const initialState: CodebridgeWorkspaceState = {
  showLockedFilesBanner: false,
};

// SLICE
const workspaceSlice = createSlice({
  name: 'codebridgeWorkspace',
  initialState,
  reducers: {
    setShowLockedFilesBanner(state, action: PayloadAction<boolean>) {
      state.showLockedFilesBanner = action.payload;
    },
  },
});

export const {setShowLockedFilesBanner} = workspaceSlice.actions;

export default workspaceSlice.reducer;
