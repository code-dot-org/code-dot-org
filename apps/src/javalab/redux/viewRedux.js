/**
 * Redux store for state specific to the visuals of Java Lab
 * (widths/heights/font sizes/etc.)
 */

import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {
  DEFAULT_FONT_SIZE_PX,
  FONT_SIZE_INCREMENT_PX,
  MAX_FONT_SIZE_PX,
  MIN_FONT_SIZE_PX
} from '@cdo/apps/javalab/editorThemes';

const COLOR_PREFERENCE_UPDATED = 'javalab/COLOR_PREFERENCE_UPDATED';
const EDITOR_HEIGHT_UPDATED = 'javalab/EDITOR_HEIGHT_UPDATED';
const LEFT_WIDTH_UPDATED = 'javalab/LEFT_WIDTH_UPDATED';
const RIGHT_WIDTH_UPDATED = 'javalab/RIGHT_WIDTH_UPDATED';
const SET_INSTRUCTIONS_HEIGHT = 'javalab/SET_INSTRUCTIONS_HEIGHT';
const SET_INSTRUCTIONS_FULL_HEIGHT = 'javalab/SET_INSTRUCTIONS_FULL_HEIGHT';
const SET_CONSOLE_HEIGHT = 'javalab/SET_CONSOLE_HEIGHT';
const EDITOR_COLUMN_HEIGHT = 'javalab/EDITOR_COLUMN_HEIGHT';
const TOGGLE_VISUALIZATION_COLLAPSED = 'javalab/TOGGLE_VISUALIZATION_COLLAPSED';
const INCREASE_EDITOR_FONT_SIZE = 'javalab/INCREASE_EDITOR_FONT_SIZE';
const DECREASE_EDITOR_FONT_SIZE = 'javalab/DECREASE_EDITOR_FONT_SIZE';

const initialState = {
  displayTheme: DisplayTheme.LIGHT,
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
  canDecreaseFontSize: DEFAULT_FONT_SIZE_PX > MIN_FONT_SIZE_PX
};

// Action Creators

// Updates the user preferences to reflect change
export const setDisplayTheme = displayTheme => {
  new UserPreferences().setDisplayTheme(displayTheme);
  return {
    displayTheme: displayTheme,
    type: COLOR_PREFERENCE_UPDATED
  };
};

export const toggleVisualizationCollapsed = () => ({
  type: TOGGLE_VISUALIZATION_COLLAPSED
});

export const increaseEditorFontSize = () => ({
  type: INCREASE_EDITOR_FONT_SIZE
});

export const decreaseEditorFontSize = () => ({
  type: DECREASE_EDITOR_FONT_SIZE
});

export const setRenderedHeight = height => ({
  type: EDITOR_HEIGHT_UPDATED,
  height
});

export const setLeftWidth = width => ({
  type: LEFT_WIDTH_UPDATED,
  width
});

export const setRightWidth = width => ({
  type: RIGHT_WIDTH_UPDATED,
  width
});

export const setInstructionsHeight = height => ({
  type: SET_INSTRUCTIONS_HEIGHT,
  height
});

export const setInstructionsFullHeight = height => ({
  type: SET_INSTRUCTIONS_FULL_HEIGHT,
  height
});

export const setConsoleHeight = height => ({
  type: SET_CONSOLE_HEIGHT,
  height
});

export const setEditorColumnHeight = editorColumnHeight => ({
  type: EDITOR_COLUMN_HEIGHT,
  editorColumnHeight
});

// Reducer
export default function reducer(state = initialState, action) {
  if (action.type === COLOR_PREFERENCE_UPDATED) {
    return {
      ...state,
      displayTheme: action.displayTheme
    };
  }
  if (action.type === EDITOR_HEIGHT_UPDATED) {
    return {
      ...state,
      renderedEditorHeight: action.height
    };
  }
  if (action.type === LEFT_WIDTH_UPDATED) {
    return {
      ...state,
      leftWidth: action.width
    };
  }
  if (action.type === RIGHT_WIDTH_UPDATED) {
    return {
      ...state,
      rightWidth: action.width
    };
  }
  if (action.type === SET_INSTRUCTIONS_HEIGHT) {
    return {
      ...state,
      instructionsHeight: action.height
    };
  }
  if (action.type === SET_INSTRUCTIONS_FULL_HEIGHT) {
    return {
      ...state,
      instructionsFullHeight: action.height
    };
  }
  if (action.type === SET_CONSOLE_HEIGHT) {
    return {
      ...state,
      consoleHeight: action.height
    };
  }
  if (action.type === EDITOR_COLUMN_HEIGHT) {
    return {
      ...state,
      editorColumnHeight: action.editorColumnHeight
    };
  }
  if (action.type === TOGGLE_VISUALIZATION_COLLAPSED) {
    return {
      ...state,
      isVisualizationCollapsed: !state.isVisualizationCollapsed
    };
  }
  if (action.type === INCREASE_EDITOR_FONT_SIZE) {
    const newFontSize = Math.min(
      MAX_FONT_SIZE_PX,
      state.editorFontSize + FONT_SIZE_INCREMENT_PX
    );
    return {
      ...state,
      editorFontSize: newFontSize,
      canIncreaseFontSize: newFontSize < MAX_FONT_SIZE_PX,
      canDecreaseFontSize: newFontSize > MIN_FONT_SIZE_PX
    };
  }
  if (action.type === DECREASE_EDITOR_FONT_SIZE) {
    const newFontSize = Math.max(
      MIN_FONT_SIZE_PX,
      state.editorFontSize - FONT_SIZE_INCREMENT_PX
    );
    return {
      ...state,
      editorFontSize: newFontSize,
      canIncreaseFontSize: newFontSize < MAX_FONT_SIZE_PX,
      canDecreaseFontSize: newFontSize > MIN_FONT_SIZE_PX
    };
  }
  return state;
}
