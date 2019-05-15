const SHOW_MINIMAL_PROJECT_HEADER = 'header/SHOW_MINIMAL_PROJECT_HEADER';
const ENABLE_LEVEL_BUILDER_SAVE_BUTTON =
  'header/ENABLE_LEVEL_BUILDER_SAVE_BUTTON';

const initialState = {
  showMinimalProjectHeader: false,
  showLevelBuilderSaveButton: false,
  getLevelBuilderChanges: undefined
};

export default (state = initialState, action) => {
  if (action.type === SHOW_MINIMAL_PROJECT_HEADER) {
    return {
      ...state,
      showMinimalProjectHeader: true
    };
  }

  if (action.type === ENABLE_LEVEL_BUILDER_SAVE_BUTTON && action.getChanges) {
    return {
      ...state,
      showLevelBuilderSaveButton: true,
      getLevelBuilderChanges: action.getChanges
    };
  }

  return state;
};

export const showMinimalProjectHeader = () => ({
  type: SHOW_MINIMAL_PROJECT_HEADER
});

export const showLevelBuilderSaveButton = getChanges => ({
  type: ENABLE_LEVEL_BUILDER_SAVE_BUTTON,
  getChanges
});
