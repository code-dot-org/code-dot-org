import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

/**
 * UI-chrome state for the Codebridge workspace. Deliberately does NOT hold file
 * data: the multi-file source lives in the base lab's `labProject.projectSources`
 * and is mutated through the codebridge file thunks (see ../fileThunks). This
 * slice only tracks presentational toggles.
 *
 * Ported from apps/src/codebridge/redux/workspaceRedux.ts.
 */
export interface CodebridgeWorkspaceState {
  showLockedFilesBanner: boolean;
  widgetViewShowCode: boolean;
  showFileBrowser: boolean;
}

export const initialState: CodebridgeWorkspaceState = {
  showLockedFilesBanner: false,
  widgetViewShowCode: false,
  showFileBrowser: true,
};

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
  },
});

export const {
  setShowLockedFilesBanner,
  setWidgetViewShowCode,
  setShowFileBrowser,
} = workspaceSlice.actions;

// Export the slice (not just its reducer) so the store can register it via
// `injectSlices`, matching the base and music lab conventions.
export default workspaceSlice;
