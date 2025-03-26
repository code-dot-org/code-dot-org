import {FontSize} from '@codebridge/constants';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
export interface CodebridgeWorkspaceState {
  showLockedFilesBanner: boolean;
  editorFontSizeKey: keyof typeof FontSize | undefined;
}

export const initialState: CodebridgeWorkspaceState = {
  showLockedFilesBanner: false,
  editorFontSizeKey: undefined,
};

// SLICE
const workspaceSlice = createSlice({
  name: 'codebridgeWorkspace',
  initialState,
  reducers: {
    setShowLockedFilesBanner(state, action: PayloadAction<boolean>) {
      state.showLockedFilesBanner = action.payload;
    },
    setEditorFontSize(
      state,
      action: PayloadAction<keyof typeof FontSize | undefined>
    ) {
      state.editorFontSizeKey = action.payload;
    },
  },
});

export const {setShowLockedFilesBanner, setEditorFontSize} =
  workspaceSlice.actions;

export default workspaceSlice.reducer;
