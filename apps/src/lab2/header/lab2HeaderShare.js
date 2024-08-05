import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {showShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import {getStore} from '@cdo/apps/redux';

import Lab2Registry from '../Lab2Registry';
import Lab2ShareDialogWrapper from '../views/Lab2ShareDialogWrapper';

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
    const root = createRoot(dialogDom);

    root.render(
      <Provider store={getStore()}>
        <Lab2ShareDialogWrapper shareUrl={shareUrl} />
      </Provider>
    );

    getStore().dispatch(showShareDialog());
  });
}
