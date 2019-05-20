/* globals dashboard, appOptions */

import React from 'react';
import ReactDOM from 'react-dom';
import ExportDialog from './components/ExportDialog';
import {Provider} from 'react-redux';
import {getStore} from '../redux';
import {showExportDialog} from './components/exportDialogRedux';

export function exportProject(shareUrl) {
  dashboard.project.saveIfSourcesChanged().then(() => {
    const i18n = window.dashboard.i18n;

    let dialogDom = document.getElementById('project-export-dialog');
    if (!dialogDom) {
      dialogDom = document.createElement('div');
      dialogDom.setAttribute('id', 'project-export-dialog');
      document.body.appendChild(dialogDom);
    }

    const appType = dashboard.project.getStandaloneApp();
    const pageConstants = getStore().getState().pageConstants;
    const canShareSocial = pageConstants.is13Plus || !pageConstants.isSignedIn;

    ReactDOM.render(
      <Provider store={getStore()}>
        <ExportDialog
          isProjectLevel={!!dashboard.project.isProjectLevel()}
          i18n={i18n}
          shareUrl={shareUrl}
          thumbnailUrl={dashboard.project.getThumbnailUrl()}
          isAbusive={dashboard.project.exceedsAbuseThreshold()}
          channelId={dashboard.project.getCurrentId()}
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
