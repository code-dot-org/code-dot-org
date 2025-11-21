import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';

import {ViewMode} from './types';

export type Weblab2State = {
  viewMode: ViewMode;
  isAcceptRejectMode: boolean;
};

const initialState: Weblab2State = {
  viewMode: ViewMode.SPLIT,
  isAcceptRejectMode: false,
};

const weblab2Slice = createSlice({
  name: 'weblab2',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setIsAcceptRejectMode: (state, action: PayloadAction<boolean>) => {
      state.isAcceptRejectMode = action.payload;
    },
  },
});

registerReducers({weblab2: weblab2Slice.reducer});

export const {setViewMode, setIsAcceptRejectMode} = weblab2Slice.actions;
