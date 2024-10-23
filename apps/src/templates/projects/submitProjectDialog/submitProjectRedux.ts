import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {registerReducers} from '@cdo/apps/redux';
export interface SubmitProjectState {
  showSubmitProjectDialog: boolean;
}

const initialState: SubmitProjectState = {
  showSubmitProjectDialog: false,
};
const submitProjectSlice = createSlice({
  name: 'submitProject',
  initialState,
  reducers: {
    setShowSubmitProjectDialog: (state, action: PayloadAction<boolean>) => {
      state.showSubmitProjectDialog = action.payload;
    },
  },
});

registerReducers({submitProject: submitProjectSlice.reducer});
export const {setShowSubmitProjectDialog} = submitProjectSlice.actions;
