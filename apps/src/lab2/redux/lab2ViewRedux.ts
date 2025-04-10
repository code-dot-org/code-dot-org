import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {FontSize} from '@cdo/apps/lab2/constants';

export interface Lab2ViewState {
  consoleFontSizeKey: keyof typeof FontSize;
  editorFontSizeKey: keyof typeof FontSize;
}

const initialState: Lab2ViewState = {
  consoleFontSizeKey: 'Small',
  editorFontSizeKey: 'Small',
};

// SLICE
const lab2ViewSlice = createSlice({
  name: 'lab2View',
  initialState,
  reducers: {
    setConsoleFontSize(state, action: PayloadAction<keyof typeof FontSize>) {
      state.consoleFontSizeKey = action.payload;
    },
    setEditorFontSize(state, action: PayloadAction<keyof typeof FontSize>) {
      state.editorFontSizeKey = action.payload;
    },
  },
});

export const {setConsoleFontSize, setEditorFontSize} = lab2ViewSlice.actions;

export default lab2ViewSlice.reducer;
