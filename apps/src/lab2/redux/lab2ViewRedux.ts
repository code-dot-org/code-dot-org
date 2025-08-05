import {PayloadAction, createSlice, createAsyncThunk} from '@reduxjs/toolkit';

import {FontSize} from '@cdo/apps/lab2/constants';
import {AppName} from '@cdo/apps/lab2/types';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';
export interface Lab2ViewState {
  consoleFontSizeKey: keyof typeof FontSize;
  editorFontSizeKey: keyof typeof FontSize;
  editorFontSizeLoaded: boolean;
  isResizing: boolean;
}

const initialState: Lab2ViewState = {
  consoleFontSizeKey: 'Small',
  editorFontSizeKey: 'Small',
  editorFontSizeLoaded: false,
  isResizing: false,
};

// THUNKS

// This thunk fetches the user's last selected console font size from the backend, then saves
// it in redux.
export const fetchAndSaveConsoleFontSize = createAsyncThunk<
  void,
  {appName: AppName},
  {dispatch: AppDispatch}
>('lab2View/fetchAndSaveConsoleFontSize', async ({appName}, {dispatch}) => {
  const savedConsoleFontSize = await new UserPreferences().getConsoleFontSize(
    appName
  );
  if (savedConsoleFontSize) {
    dispatch(setConsoleFontSize(savedConsoleFontSize));
  }
});

// This thunk fetches the user's last selected editor font size from the backend, then saves
// it in redux.
export const fetchAndSaveEditorFontSize = createAsyncThunk<
  void,
  {appName: AppName},
  {dispatch: AppDispatch}
>('lab2View/fetchAndSaveEditorFontSize', async ({appName}, {dispatch}) => {
  const savedEditorFontSize = await new UserPreferences().getEditorFontSize(
    appName
  );
  if (savedEditorFontSize) {
    dispatch(setEditorFontSize(savedEditorFontSize));
  }
  dispatch(setEditorFontSizeLoaded(true));
});

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
    setEditorFontSizeLoaded(state, action: PayloadAction<boolean>) {
      state.editorFontSizeLoaded = action.payload;
    },
    setIsResizing(state, action: PayloadAction<boolean>) {
      state.isResizing = action.payload;
    },
  },
});

export const {
  setConsoleFontSize,
  setEditorFontSize,
  setEditorFontSizeLoaded,
  setIsResizing,
} = lab2ViewSlice.actions;

export default lab2ViewSlice.reducer;
