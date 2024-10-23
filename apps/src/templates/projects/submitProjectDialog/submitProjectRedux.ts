import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';
export interface SubmitProjectState {
  showSubmitProjectDialog: boolean;
  showShareDialog: boolean;
}

const initialState: SubmitProjectState = {
  showSubmitProjectDialog: false,
  showShareDialog: true,
};
const submitProjectSlice = createSlice({
  name: 'submitProject',
  initialState,
  reducers: {
    setShowSubmitProjectDialog: (state, action: PayloadAction<boolean>) => {
      state.showSubmitProjectDialog = action.payload;
    },
    setShowShareDialog: (state, action: PayloadAction<boolean>) => {
      state.showShareDialog = action.payload;
    },
  },
});

registerReducers({submitProject: submitProjectSlice.reducer});
export const {setShowSubmitProjectDialog, setShowShareDialog} =
  submitProjectSlice.actions;
