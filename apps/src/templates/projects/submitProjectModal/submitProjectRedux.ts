import {createSlice, PayloadAction} from '@reduxjs/toolkit';
export interface SubmitProjectState {
  showSubmitModal: boolean;
}

const initialState: SubmitProjectState = {
  showSubmitModal: false,
};
const submitProjectSlice = createSlice({
  name: 'submitProject',
  initialState,
  reducers: {
    setShowSubmitModal: (state, action: PayloadAction<boolean>) => {
      state.showSubmitModal = action.payload;
    },
  },
});

export default submitProjectSlice.reducer;
