import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import LabRegistry from '../LabRegistry';
import {getStore} from '@cdo/apps/redux';
import Lab2ShareDialog from './Lab2ShareDialog';
import {showShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';

/**
 * Save, then show the share dialog for a Lab2 project.
 * @param {string} shareUrl - The URL of the project to share.
 */
export function shareLab2Project(shareUrl) {
  const projectManager = LabRegistry.getInstance().getProjectManager();
  if (!projectManager) {
    return null;
  }

  projectManager.flushSave().then(() => {
    var dialogDom = document.getElementById('project-share-dialog');
    if (!dialogDom) {
      dialogDom = document.createElement('div');
      dialogDom.setAttribute('id', 'project-share-dialog');
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
