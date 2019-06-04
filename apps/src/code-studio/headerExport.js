/* globals appOptions */

import React from 'react';
import ReactDOM from 'react-dom';
import ExportDialog from './components/ExportDialog';
import {Provider} from 'react-redux';
import {getStore} from '../redux';
import {showExportDialog} from './components/exportDialogRedux';
import project from './initApp/project';
import i18n from './i18n';

export function exportProject(shareUrl) {
  project.saveIfSourcesChanged().then(() => {
    let dialogDom = document.getElementById('project-export-dialog');
    if (!dialogDom) {
      dialogDom = document.createElement('div');
      dialogDom.setAttribute('id', 'project-export-dialog');
      document.body.appendChild(dialogDom);
    }

    const appType = project.getStandaloneApp();
    const pageConstants = getStore().getState().pageConstants;
    const canShareSocial = pageConstants.is13Plus || !pageConstants.isSignedIn;

    ReactDOM.render(
      <Provider store={getStore()}>
        <ExportDialog
          isProjectLevel={!!project.isProjectLevel()}
          i18n={i18n}
          shareUrl={shareUrl}
          thumbnailUrl={project.getThumbnailUrl()}
          isAbusive={project.exceedsAbuseThreshold()}
          channelId={project.getCurrentId()}
          appType={appType}
          canShareSocial={canShareSocial}
          userSharingDisabled={appOptions.userSharingDisabled}
        />
      </Provider>,
      dialogDom
    );

    getStore().dispatch(showExportDialog());
  });
}
