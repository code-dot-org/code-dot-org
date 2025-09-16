import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

import {ViewMode} from './types';

export type Weblab2State = {
  viewMode: ViewMode;
};

const initialState: Weblab2State = {
  viewMode: ViewMode.SPLIT,
};

const weblab2Slice = createSlice({
  name: 'weblab2',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
  },
});

registerReducers({weblab2: weblab2Slice.reducer});

export const {setViewMode} = weblab2Slice.actions;
