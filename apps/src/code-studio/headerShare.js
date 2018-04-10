/* globals dashboard, appOptions */

import React from 'react';
import ReactDOM from 'react-dom';
import popupWindow from './popup-window';
import ShareDialog from './components/ShareDialog';
import { Provider } from 'react-redux';
import { getStore } from '../redux';
import { showShareDialog } from './components/shareDialogRedux';
import { PublishableProjectTypesOver13 } from '../util/sharedConstants';
import experiments from '../util/experiments';

export function shareProject(shareUrl) {
  dashboard.project.save().then(() => {

    var i18n = window.dashboard.i18n;

    var dialogDom = document.getElementById('project-share-dialog');
    if (!dialogDom) {
      dialogDom = document.createElement('div');
      dialogDom.setAttribute('id', 'project-share-dialog');
      document.body.appendChild(dialogDom);
    }

    const pageConstants = getStore().getState().pageConstants;
    const canShareSocial = !pageConstants.isSignedIn || pageConstants.is13Plus;
    const appType = dashboard.project.getStandaloneApp();

    // Allow publishing for any project type that older students can publish.
    // Younger students should never be able to get to the share dialog in the
    // first place, so there's no need to check age against project types here.
    const canPublish = !!appOptions.isSignedIn &&
      PublishableProjectTypesOver13.includes(appType);

    const exportExpoApp = (expoOpts) => {
      if (window.Applab) {
        return window.Applab.exportApp(expoOpts);
      } else {
        return Promise.reject(new Error('No Global Applab'));
      }
    };

    ReactDOM.render(
      <Provider store={getStore()}>
        <ShareDialog
          isProjectLevel={!!dashboard.project.isProjectLevel()}
          i18n={i18n}
          shareUrl={shareUrl}
          thumbnailUrl={dashboard.project.getThumbnailUrl()}
          isAbusive={dashboard.project.exceedsAbuseThreshold()}
          canPrint={appType === "artist"}
          canPublish={canPublish}
          isPublished={dashboard.project.isPublished()}
          channelId={dashboard.project.getCurrentId()}
          appType={appType}
          onClickPopup={popupWindow}
          // TODO: Can I not proliferate the use of global references to Applab somehow?
          onClickExport={window.Applab ? window.Applab.exportApp : null}
          onClickExportExpo={experiments.isEnabled('exportExpo') ? exportExpoApp : null}
          canShareSocial={canShareSocial}
          userSharingDisabled={appOptions.userSharingDisabled}
        />
      </Provider>,
      dialogDom
    );

    getStore().dispatch(showShareDialog());
  });
}
