import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CodebridgeWorkspaceState {
  showLockedFilesBanner: boolean;
  widgetViewShowCode: boolean;
}

export const initialState: CodebridgeWorkspaceState = {
  showLockedFilesBanner: false,
  widgetViewShowCode: false,
};

// SLICE
const workspaceSlice = createSlice({
  name: 'codebridgeWorkspace',
  initialState,
  reducers: {
    setShowLockedFilesBanner(state, action: PayloadAction<boolean>) {
      state.showLockedFilesBanner = action.payload;
    },
    setWidgetViewShowCode(state, action: PayloadAction<boolean>) {
      state.widgetViewShowCode = action.payload;
    },
  },
});

export const {setShowLockedFilesBanner, setWidgetViewShowCode} =
  workspaceSlice.actions;

export default workspaceSlice.reducer;
