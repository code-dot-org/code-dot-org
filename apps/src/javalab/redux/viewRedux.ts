/**
 * Redux store for state specific to the visuals of Java Lab
 * (widths/heights/font sizes/etc.)
 */

// TODO: Can we fix our imports and no longer need to ignore this rule?
/* eslint-disable @typescript-eslint/no-var-requires */

import {
  AnyAction,
  PayloadAction,
  ThunkAction,
  createSlice,
} from '@reduxjs/toolkit';

import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {
  DEFAULT_FONT_SIZE_PX,
  FONT_SIZE_INCREMENT_PX,
  MAX_FONT_SIZE_PX,
  MIN_FONT_SIZE_PX,
} from '@cdo/apps/javalab/editorThemes';

type DisplayThemeValue = 'light' | 'dark';

interface JavalabViewState {
  displayTheme: DisplayThemeValue;
  renderedEditorHeight: number;
  leftWidth: number;
  rightWidth: number;
  instructionsHeight: number;
  instructionsFullHeight: number;
  consoleHeight: number;
  editorColumnHeight: number;
  isVisualizationCollapsed: boolean;
  editorFontSize: number;
  canIncreaseFontSize: boolean;
  canDecreaseFontSize: boolean;
}

const initialState: JavalabViewState = {
  displayTheme: DisplayTheme.LIGHT as DisplayThemeValue,
  renderedEditorHeight: 400,
  leftWidth: 400,
  rightWidth: 400,
  instructionsHeight: 200,
  instructionsFullHeight: 200,
  consoleHeight: 200,
  editorColumnHeight: 600,
  isVisualizationCollapsed: false,
  editorFontSize: DEFAULT_FONT_SIZE_PX,
  canIncreaseFontSize: DEFAULT_FONT_SIZE_PX < MAX_FONT_SIZE_PX,
  canDecreaseFontSize: DEFAULT_FONT_SIZE_PX > MIN_FONT_SIZE_PX,
};

// THUNKS
export const setDisplayTheme = (
  displayTheme: DisplayThemeValue
): ThunkAction<void, JavalabViewState, undefined, AnyAction> => {
  return dispatch => {
    dispatch(javalabViewSlice.actions.setDisplayThemeValue(displayTheme));
    new UserPreferences().setDisplayTheme(displayTheme);
  };
};

// SLICE
const javalabViewSlice = createSlice({
  name: 'javalabView',
  initialState,
  reducers: {
    setDisplayThemeValue(state, action: PayloadAction<DisplayThemeValue>) {
      state.displayTheme = action.payload;
    },
    toggleVisualizationCollapsed(state) {
      state.isVisualizationCollapsed = !state.isVisualizationCollapsed;
    },
    increaseEditorFontSize(state) {
      const newFontSize = Math.min(
        MAX_FONT_SIZE_PX,
        state.editorFontSize + FONT_SIZE_INCREMENT_PX
      );
      updateEditorFontSize(state, newFontSize);
    },
    decreaseEditorFontSize(state) {
      const newFontSize = Math.max(
        MIN_FONT_SIZE_PX,
        state.editorFontSize - FONT_SIZE_INCREMENT_PX
      );
      updateEditorFontSize(state, newFontSize);
    },
    setRenderedHeight(state, action: PayloadAction<number>) {
      state.renderedEditorHeight = action.payload;
    },
    setLeftWidth(state, action: PayloadAction<number>) {
      state.leftWidth = action.payload;
    },
    setRightWidth(state, action: PayloadAction<number>) {
      state.rightWidth = action.payload;
    },
    setInstructionsHeight(state, action: PayloadAction<number>) {
      state.instructionsHeight = action.payload;
    },
    setInstructionsFullHeight(state, action: PayloadAction<number>) {
      state.instructionsFullHeight = action.payload;
    },
    setConsoleHeight(state, action: PayloadAction<number>) {
      state.consoleHeight = action.payload;
    },
    setEditorColumnHeight(state, action: PayloadAction<number>) {
      state.editorColumnHeight = action.payload;
    },
  },
});

function updateEditorFontSize(state: JavalabViewState, newFontSize: number) {
  state.editorFontSize = newFontSize;
  state.canIncreaseFontSize = newFontSize < MAX_FONT_SIZE_PX;
  state.canDecreaseFontSize = newFontSize > MIN_FONT_SIZE_PX;
}

export const {
  toggleVisualizationCollapsed,
  increaseEditorFontSize,
  decreaseEditorFontSize,
  setRenderedHeight,
  setLeftWidth,
  setRightWidth,
  setInstructionsHeight,
  setInstructionsFullHeight,
  setConsoleHeight,
  setEditorColumnHeight,
} = javalabViewSlice.actions;

export default javalabViewSlice.reducer;
