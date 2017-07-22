
// Action types

const SHOW_PUBLISH_DIALOG = 'publishDialog/SHOW_PUBLISH_DIALOG';
const HIDE_PUBLISH_DIALOG = 'publishDialog/HIDE_PUBLISH_DIALOG';

// Reducer

const initialState = {
  isOpen: false,
  projectId: null,
  projectType: null,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_PUBLISH_DIALOG:
      return {
        isOpen: true,
        projectId: action.projectId,
        projectType: action.projectType,
      };
    case HIDE_PUBLISH_DIALOG:
      return {
        isOpen: false,
        projectId: null,
        projectType: null,
      };
    default:
      return state;
  }
}

// Action creators

export function showPublishDialog(projectId, projectType) {
  return {type: SHOW_PUBLISH_DIALOG, projectId, projectType};
}

export function hidePublishDialog() {
  return {type: HIDE_PUBLISH_DIALOG};
}
