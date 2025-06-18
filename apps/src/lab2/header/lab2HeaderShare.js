import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {showShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import trackEvent from '@cdo/apps/util/trackEvent';

import Lab2Registry from '../Lab2Registry';
import Lab2ShareDialogWrapper from '../views/Lab2ShareDialogWrapper';

const PROJECT_SHARE_DIALOG_ID = 'project-share-dialog';

/**
 * Save, then show the share dialog for a Lab2 project.
 */
export function shareLab2Project(dialogId, finishUrl) {
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
          shareDialogId={dialogId}
          shareUrl={shareUrl}
          finishUrl={finishUrl}
        />
      </Provider>,
      dialogDom
    );

    getStore().dispatch(showShareDialog());
    const projectType = projectManager.getProjectType();
    analyticsReporter.sendEvent(
      EVENTS.SHARING_DIALOG_OPEN,
      {
        lab_type: projectType,
        channel_id: projectManager.getChannelId(),
        dialog_id: dialogId,
      },
      PLATFORMS.BOTH
    );
    trackEvent('share', 'share_open_dialog', {
      value:
        dialogId === 'hoc2024'
          ? 'share_open_dialog_congrats_hoc2024'
          : projectType,
    });
  });
}
