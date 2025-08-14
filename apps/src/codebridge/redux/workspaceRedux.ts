import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CodebridgeWorkspaceState {
  showLockedFilesBanner: boolean;
  widgetViewShowCode: boolean;
  showFileBrowser: boolean;
  showFlaggedImageModal: boolean;
}

export const initialState: CodebridgeWorkspaceState = {
  showLockedFilesBanner: false,
  widgetViewShowCode: false,
  showFileBrowser: true,
  showFlaggedImageModal: false,
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
    setShowFileBrowser(state, action: PayloadAction<boolean>) {
      state.showFileBrowser = action.payload;
    },
    setShowFlaggedImageModal(state, action: PayloadAction<boolean>) {
      state.showFlaggedImageModal = action.payload;
    },
  },
});

export const {
  setShowLockedFilesBanner,
  setWidgetViewShowCode,
  setShowFileBrowser,
  setShowFlaggedImageModal,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
