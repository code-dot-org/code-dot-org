import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Lab2Registry from '../Lab2Registry';
import {getStore} from '@cdo/apps/redux';
import Lab2ShareDialog from '../views/Lab2ShareDialog';
import {showShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';

const PROJECT_SHARE_DIALOG_ID = 'project-share-dialog';

/**
 * Save, then show the share dialog for a Lab2 project.
 * @param {string} shareUrl - The URL of the project to share.
 */
export function shareLab2Project(shareUrl) {
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  if (!projectManager) {
    return null;
  }

  projectManager.flushSave().then(() => {
    var dialogDom = document.getElementById(PROJECT_SHARE_DIALOG_ID);
    if (!dialogDom) {
      dialogDom = document.createElement('div');
      dialogDom.setAttribute('id', PROJECT_SHARE_DIALOG_ID);
      document.body.appendChild(dialogDom);
    }
    ReactDOM.render(
      <Provider store={getStore()}>
        <Lab2ShareDialog shareUrl={shareUrl} />
      </Provider>,
      dialogDom
    );

    getStore().dispatch(showShareDialog());
  });
}
