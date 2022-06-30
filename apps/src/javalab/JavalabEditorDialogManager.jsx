import {makeEnum} from '@cdo/apps/utils';

export const JavalabEditorDialog = makeEnum(
  'RENAME_FILE',
  'DELETE_FILE',
  'CREATE_FILE',
  'COMMIT_FILES',
  'VERSION_HISTORY'
);

function JavalabDialogManager(props) {
  // TODO: Move JavalabEditor dialogs here
}

export default JavalabDialogManager;
