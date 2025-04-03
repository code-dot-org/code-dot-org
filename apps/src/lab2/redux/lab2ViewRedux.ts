import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {FontSize} from '@cdo/apps/lab2/constants';

export interface Lab2ViewState {
  editorFontSizeKey: keyof typeof FontSize;
}

const initialState: Lab2ViewState = {
  editorFontSizeKey: 'Small',
};

// SLICE
const lab2ViewSlice = createSlice({
  name: 'lab2View',
  initialState,
  reducers: {
    setEditorFontSize(state, action: PayloadAction<keyof typeof FontSize>) {
      state.editorFontSizeKey = action.payload;
    },
  },
});

export const {setEditorFontSize} = lab2ViewSlice.actions;

export default lab2ViewSlice.reducer;
