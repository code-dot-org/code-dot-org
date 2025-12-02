import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

import {ProjectFile} from '../lab2/types';

import {ViewMode} from './types';

export type Weblab2State = {
  viewMode: ViewMode;
  aiFilePathToPreview: string | undefined;
  aiTutorVersionFiles: ProjectFile[] | undefined;
};

const initialState: Weblab2State = {
  viewMode: ViewMode.SPLIT,
  aiFilePathToPreview: undefined,
  aiTutorVersionFiles: undefined,
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
      action: PayloadAction<string | undefined>
    ) => {
      state.aiFilePathToPreview = action.payload;
    },
    setAiTutorVersionFiles: (
      state,
      action: PayloadAction<ProjectFile[] | undefined>
    ) => {
      state.aiTutorVersionFiles = action.payload;
    },
  },
});

registerReducers({weblab2: weblab2Slice.reducer});

export const {setViewMode, setAiFilePathToPreview, setAiTutorVersionFiles} =
  weblab2Slice.actions;
