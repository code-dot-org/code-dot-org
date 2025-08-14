import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {analyticsEvents} from '@cdo/apps/lab2/hooks/useFileUploader';

export interface FlaggedImageData {
  file: File;
  fileType: string;
  channelId: string;
  fileName: string;
  callback: (
    filename: string,
    contents: string,
    uploadUrl?: string,
    callbackArgs?: unknown
  ) => void;
  callbackArgs?: unknown;
  sendAnalyticsEvent: (
    eventName: analyticsEvents,
    payload: Record<string, string>
  ) => void;
}

export interface CodebridgeWorkspaceState {
  showLockedFilesBanner: boolean;
  widgetViewShowCode: boolean;
  showFileBrowser: boolean;
  showFlaggedImageModal: boolean;
  flaggedImageData?: FlaggedImageData;
}

export const initialState: CodebridgeWorkspaceState = {
  showLockedFilesBanner: false,
  widgetViewShowCode: false,
  showFileBrowser: true,
  showFlaggedImageModal: false,
  flaggedImageData: undefined,
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
      if (!action.payload) {
        // Clear flagged image data when modal is closed
        state.flaggedImageData = undefined;
      }
    },
    setFlaggedImageData(state, action: PayloadAction<FlaggedImageData>) {
      state.flaggedImageData = action.payload;
      state.showFlaggedImageModal = true;
    },
  },
});

export const {
  setShowLockedFilesBanner,
  setWidgetViewShowCode,
  setShowFileBrowser,
  setShowFlaggedImageModal,
  setFlaggedImageData,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
