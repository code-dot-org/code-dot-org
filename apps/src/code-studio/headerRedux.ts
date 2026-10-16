import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export const possibleHeaders = {
  project: 'project',
  minimalProject: 'minimalProject',
  projectBacked: 'projectBacked',
  levelBuilderSave: 'levelBuilderSave',
} as const;

/** The lab's Continue button, as the progress widget draws it in the header. */
export interface HeaderNavigation {
  label: string;
  enabled: boolean;
  tooltip?: string;
}

export interface HeaderReduxState {
  /** The header shows the progress widget, which takes over the lab's Continue button. */
  progressWidget: boolean;
  headerNavigation: HeaderNavigation | undefined;
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
}

const initialState: HeaderReduxState = {
  progressWidget: false,
  headerNavigation: undefined,
  currentHeader: undefined,
  getLevelBuilderChanges: undefined,
  overrideHeaderText: undefined,
  overrideOnSaveUrl: undefined,
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
    showProgressWidget(state) {
      state.progressWidget = true;
    },
    setHeaderNavigation(state, action: PayloadAction<HeaderNavigation>) {
      state.headerNavigation = action.payload;
    },
    clearHeaderNavigation(state) {
      state.headerNavigation = undefined;
    },
  },
});

export const {
  showProjectHeader,
  showMinimalProjectHeader,
  showProjectBackedHeader,
  showLevelBuilderSaveButton,
  clearHeader,
  showProgressWidget,
  setHeaderNavigation,
  clearHeaderNavigation,
} = headerSlice.actions;

export default headerSlice.reducer;
