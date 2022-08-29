const SHOW_PROJECT_HEADER = 'header/SHOW_PROJECT_HEADER';
const SHOW_MINIMAL_PROJECT_HEADER = 'header/SHOW_MINIMAL_PROJECT_HEADER';
const SHOW_PROJECT_BACKED_HEADER = 'header/SHOW_PROJECT_BACKED_HEADER';
const ENABLE_LEVEL_BUILDER_SAVE_BUTTON =
  'header/ENABLE_LEVEL_BUILDER_SAVE_BUTTON';

export const possibleHeaders = {
  project: 'project',
  minimalProject: 'minimalProject',
  projectBacked: 'projectBacked',
  levelBuilderSave: 'levelBuilderSave'
};

const initialState = {
  currentHeader: undefined,
  getLevelBuilderChanges: undefined,
  includeExportInProjectHeader: false
};

export default (state = initialState, action) => {
  if (action.type === SHOW_PROJECT_HEADER) {
    return {
      ...state,
      currentHeader: possibleHeaders.project,
      includeExportInProjectHeader: action.showExport
    };
  } else if (action.type === SHOW_MINIMAL_PROJECT_HEADER) {
    return {
      ...state,
      currentHeader: possibleHeaders.minimalProject
    };
  } else if (action.type === SHOW_PROJECT_BACKED_HEADER) {
    return {
      ...state,
      currentHeader: possibleHeaders.projectBacked,
      includeExportInProjectHeader: action.showExport
    };
  } else if (
    action.type === ENABLE_LEVEL_BUILDER_SAVE_BUTTON &&
    action.getChanges
  ) {
    const updatedState = {
      ...state,
      currentHeader: possibleHeaders.levelBuilderSave,
      getLevelBuilderChanges: action.getChanges
    };

    if (action.overrideHeaderText) {
      updatedState.overrideHeaderText = action.overrideHeaderText;
    }
    if (action.overrideOnSaveURL) {
      updatedState.overrideOnSaveURL = action.overrideOnSaveURL;
    }
    return updatedState;
  }
  return state;
};

export const showProjectHeader = showExport => ({
  type: SHOW_PROJECT_HEADER,
  showExport
});

export const showMinimalProjectHeader = () => ({
  type: SHOW_MINIMAL_PROJECT_HEADER
});

export const showProjectBackedHeader = showExport => ({
  type: SHOW_PROJECT_BACKED_HEADER,
  showExport
});

export const showLevelBuilderSaveButton = (
  getChanges,
  overrideHeaderText,
  overrideOnSaveURL
) => ({
  type: ENABLE_LEVEL_BUILDER_SAVE_BUTTON,
  getChanges,
  overrideHeaderText,
  overrideOnSaveURL
});
