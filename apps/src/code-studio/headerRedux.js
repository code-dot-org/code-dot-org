import Immutable from 'immutable';

// Action types

const SHOW_SHARE_DIALOG = 'header/SHOW_SHARE_DIALOG';
const SHOW_PUBLISH_DIALOG = 'header/SHOW_PUBLISH_DIALOG';
const HIDE_DIALOGS = 'header/HIDE_DIALOGS';

// Reducer

const initialState = Immutable.fromJS({
  isShareDialogOpen: false,
  isPublishDialogOpen: false,
  projectIdToPublish: null,
  projectTypeToPublish: null,
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_SHARE_DIALOG:
      return state.merge({
        isShareDialogOpen: true,
      });
    case SHOW_PUBLISH_DIALOG:
      return state.merge({
        isShareDialogOpen: false,
        isPublishDialogOpen: true,
        projectIdToPublish: action.projectId,
        projectTypeToPublish: action.projectType,
      });
    case HIDE_DIALOGS:
      return state.merge({
        isShareDialogOpen: false,
        isPublishDialogOpen: false,
        projectIdToPublish: null,
        projectTypeToPublish: null,
      });
    default:
      return state;
  }
}

// Action creators

export function showShareDialog() {
  return {type: SHOW_SHARE_DIALOG};
}

export function showPublishDialog(projectId, projectType) {
  return {type: SHOW_PUBLISH_DIALOG, projectId, projectType};
}

export function hideDialogs() {
  return {type: HIDE_DIALOGS};
}
