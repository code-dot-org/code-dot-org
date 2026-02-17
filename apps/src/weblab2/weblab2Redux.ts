import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

import {ProjectFile} from '../lab2/types';

import {ViewMode} from './types';

export type AiFilePathToPreview = {
  path: string;
  timestamp: number;
};

export type Weblab2State = {
  viewMode: ViewMode;
  aiFilePathToPreview: AiFilePathToPreview | undefined;
  aiTutorVersionFiles: ProjectFile[] | undefined;
  debugPanelOpen: boolean;
};

const initialState: Weblab2State = {
  viewMode: ViewMode.SPLIT,
  aiFilePathToPreview: undefined,
  aiTutorVersionFiles: undefined,
  debugPanelOpen: false,
};

const weblab2Slice = createSlice({
  name: 'weblab2',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setAiFilePathToPreview: (
      state,
      action: PayloadAction<AiFilePathToPreview | undefined>
    ) => {
      state.aiFilePathToPreview = action.payload;
    },
    setAiTutorVersionFiles: (
      state,
      action: PayloadAction<ProjectFile[] | undefined>
    ) => {
      state.aiTutorVersionFiles = action.payload;
    },
    setDebugPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.debugPanelOpen = action.payload;
    },
  },
});

registerReducers({weblab2: weblab2Slice.reducer});

export const {
  setViewMode,
  setAiFilePathToPreview,
  setAiTutorVersionFiles,
  setDebugPanelOpen,
} = weblab2Slice.actions;
