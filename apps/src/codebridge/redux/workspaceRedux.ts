import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CspViolation {
  blockedURI: string;
  displayedURI: string;
}

export interface CodebridgeWorkspaceState {
  showLockedFilesBanner: boolean;
  widgetViewShowCode: boolean;
  showFileBrowser: boolean;
  cspViolations: CspViolation[];
}

export const initialState: CodebridgeWorkspaceState = {
  showLockedFilesBanner: false,
  widgetViewShowCode: false,
  showFileBrowser: true,
  cspViolations: [],
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
    setCspViolations(state, action: PayloadAction<CspViolation[]>) {
      state.cspViolations = action.payload;
    },
  },
});

export const {
  setShowLockedFilesBanner,
  setWidgetViewShowCode,
  setShowFileBrowser,
  setCspViolations,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
