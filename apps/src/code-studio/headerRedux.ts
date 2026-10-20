import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export const possibleHeaders = {
  project: 'project',
  minimalProject: 'minimalProject',
  projectBacked: 'projectBacked',
  levelBuilderSave: 'levelBuilderSave',
} as const;

// For a lab that tracks its own progress within one level: SimpleHeader shows
// the name in place of the unit name and the bar in place of the one it
// derives from the unit's levels.
export interface SimpleHeaderOverride {
  name: string;
  progress?: {position: number; total: number; valueText?: string};
}

export interface HeaderReduxState {
  currentHeader: keyof typeof possibleHeaders | undefined;
  // In general, we should not put functions into redux, but in order to
  // maintain existing functionality we have a function here. When we add
  // levelbuilder functionality to Lab2, we should consider alternate ways to
  // get this data rather than storing a function in redux.
  // Details on why we should not store functions in redux:
  // https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state
  getLevelBuilderChanges: (() => object) | undefined;
  overrideHeaderText: string | undefined;
  overrideOnSaveUrl: string | undefined;
  simpleHeaderOverride: SimpleHeaderOverride | undefined;
}

const initialState: HeaderReduxState = {
  currentHeader: undefined,
  getLevelBuilderChanges: undefined,
  overrideHeaderText: undefined,
  overrideOnSaveUrl: undefined,
  simpleHeaderOverride: undefined,
};

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    showProjectHeader(state) {
      state.currentHeader = possibleHeaders.project;
    },
    showMinimalProjectHeader(state) {
      state.currentHeader = possibleHeaders.minimalProject;
    },
    showProjectBackedHeader(state) {
      state.currentHeader = possibleHeaders.projectBacked;
    },
    showLevelBuilderSaveButton: {
      reducer(
        state,
        action: PayloadAction<{
          getChanges: () => object;
          overrideHeaderText: string;
          overrideOnSaveUrl: string;
        }>
      ) {
        state.currentHeader = possibleHeaders.levelBuilderSave;
        state.getLevelBuilderChanges = action.payload.getChanges;
        state.overrideHeaderText = action.payload.overrideHeaderText;
        state.overrideOnSaveUrl = action.payload.overrideOnSaveUrl;
      },
      prepare(
        getChanges: () => object,
        overrideHeaderText: string,
        overrideOnSaveUrl: string
      ) {
        return {payload: {getChanges, overrideHeaderText, overrideOnSaveUrl}};
      },
    },
    clearHeader(state) {
      state.currentHeader = undefined;
    },
    setSimpleHeaderOverride(
      state,
      action: PayloadAction<SimpleHeaderOverride>
    ) {
      state.simpleHeaderOverride = action.payload;
    },
    clearSimpleHeaderOverride(state) {
      state.simpleHeaderOverride = undefined;
    },
  },
});

export const {
  showProjectHeader,
  showMinimalProjectHeader,
  showProjectBackedHeader,
  showLevelBuilderSaveButton,
  clearHeader,
  setSimpleHeaderOverride,
  clearSimpleHeaderOverride,
} = headerSlice.actions;

export default headerSlice.reducer;
