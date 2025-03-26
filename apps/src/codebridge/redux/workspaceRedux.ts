import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CodebridgeWorkspaceState {
  showLockedFilesBanner: boolean;
  editorFontSize: number | undefined;
}

export const initialState: CodebridgeWorkspaceState = {
  showLockedFilesBanner: false,
  editorFontSize: undefined,
};

// SLICE
const workspaceSlice = createSlice({
  name: 'codebridgeWorkspace',
  initialState,
  reducers: {
    setShowLockedFilesBanner(state, action: PayloadAction<boolean>) {
      state.showLockedFilesBanner = action.payload;
    },
    setEditorFontSize(state, action: PayloadAction<number>) {
      state.editorFontSize = action.payload;
    },
  },
});

export const {setShowLockedFilesBanner, setEditorFontSize} =
  workspaceSlice.actions;

export default workspaceSlice.reducer;
