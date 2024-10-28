import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {showShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import {getStore} from '@cdo/apps/redux';
import {fetchSubmissionStatus} from '@cdo/apps/templates/projects/submitProjectDialog/submitProjectRedux';

import Lab2Registry from '../Lab2Registry';
import Lab2ShareDialogWrapper from '../views/Lab2ShareDialogWrapper';

const PROJECT_SHARE_DIALOG_ID = 'project-share-dialog';

/**
 * Save, then show the share dialog for a Lab2 project.
 */
export function shareLab2Project(id, finishUrl) {
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  if (!projectManager) {
    return null;
  }

  const shareUrl = projectManager.getShareUrl();

  projectManager.flushSave().then(() => {
    var dialogDom = document.getElementById(PROJECT_SHARE_DIALOG_ID);
    if (!dialogDom) {
      dialogDom = document.createElement('div');
      dialogDom.setAttribute('id', PROJECT_SHARE_DIALOG_ID);
      document.body.appendChild(dialogDom);
    }
    ReactDOM.render(
      <Provider store={getStore()}>
        <Lab2ShareDialogWrapper
          dialogId={id}
          shareUrl={shareUrl}
          finishUrl={finishUrl}
        />
      </Provider>,
      dialogDom
    );

    getStore().dispatch(showShareDialog());
    getStore().dispatch(fetchSubmissionStatus());
  });
}
