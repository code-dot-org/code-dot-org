import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import LabRegistry from '../LabRegistry';
import {getStore} from '@cdo/apps/redux';
import ProjectWrappedShareDialog from './ProjectWrappedShareDialog';
import {showShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';

/**
 * Save, then show the share dialog for a project that uses the ProjectManager.
 * @param {string} shareUrl - The URL of the project to share.
 */
export function shareProjectV2(shareUrl) {
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
        <ProjectWrappedShareDialog shareUrl={shareUrl} />
      </Provider>,
      dialogDom
    );

    getStore().dispatch(showShareDialog());
  });
}
