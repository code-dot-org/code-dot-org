import {
  type PayloadAction,
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import type {AppName, ApiClient, QueryClient} from '@code-dot-org/core/api';
import {preferencesKeys} from '@code-dot-org/core/api';

import type {FontSizeKey} from '../constants';
import type {AppDispatch} from '../redux/store';
// TODO: move to api
export interface LabViewState {
  consoleFontSizeKey: FontSizeKey;
  editorFontSizeKey: FontSizeKey;
  editorFontSizeLoaded: boolean;
  isStandaloneCollapsed?: boolean;
}

const initialState: LabViewState = {
  consoleFontSizeKey: 'Small',
  editorFontSizeKey: 'Small',
  editorFontSizeLoaded: false,
  isStandaloneCollapsed: false,
};

// THUNKS

// This thunk fetches the user's last selected console font size from the backend, then saves
// it in redux.
export const fetchAndSaveConsoleFontSize = createAsyncThunk<
  void,
  {
    apiClient: ApiClient;
    queryClient: QueryClient;
    appName: AppName;
  },
  {dispatch: AppDispatch}
>(
  'lab2View/fetchAndSaveConsoleFontSize',
  async ({apiClient, queryClient, appName}, {dispatch}) => {
    const savedConsoleFontSize = await queryClient.fetchQuery({
      queryKey: preferencesKeys.consoleFontSize(appName),
      queryFn: () =>
        apiClient.preferences.getConsoleFontSize({
          appName,
        }),
    });
    if (savedConsoleFontSize) {
      dispatch(setConsoleFontSize(savedConsoleFontSize));
    }
  },
);

// This thunk fetches the user's last selected editor font size from the backend, then saves
// it in redux.
export const fetchAndSaveEditorFontSize = createAsyncThunk<
  void,
  {
    apiClient: ApiClient;
    queryClient: QueryClient;
    appName: AppName;
  },
  {dispatch: AppDispatch}
>(
  'lab2View/fetchAndSaveEditorFontSize',
  async ({apiClient, queryClient, appName}, {dispatch}) => {
    const savedEditorFontSize = await queryClient.fetchQuery({
      queryKey: preferencesKeys.editorFontSize(appName),
      queryFn: () =>
        apiClient.preferences.getEditorFontSize({
          appName,
        }),
    });
    if (savedEditorFontSize) {
      dispatch(setEditorFontSize(savedEditorFontSize));
    }
    dispatch(setEditorFontSizeLoaded(true));
  },
);

// SLICE
const viewSlice = createSlice({
  name: 'labView',
  initialState,
  reducers: {
    setConsoleFontSize(state, action: PayloadAction<FontSizeKey>) {
      state.consoleFontSizeKey = action.payload;
    },
    setEditorFontSize(state, action: PayloadAction<FontSizeKey>) {
      state.editorFontSizeKey = action.payload;
    },
    setEditorFontSizeLoaded(state, action: PayloadAction<boolean>) {
      state.editorFontSizeLoaded = action.payload;
    },
    setIsStandaloneCollapsed(state, action: PayloadAction<boolean>) {
      state.isStandaloneCollapsed = action.payload;
    },
  },
});

export const {
  setConsoleFontSize,
  setEditorFontSize,
  setEditorFontSizeLoaded,
  setIsStandaloneCollapsed,
} = viewSlice.actions;

export default viewSlice;
