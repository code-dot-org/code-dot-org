import React from 'react';
import ReactDOM from 'react-dom';
import popupWindow from './popup-window';
import ShareDialog from './components/ShareDialog';
import {Provider} from 'react-redux';
import {getStore} from '../redux';
import {showShareDialog} from './components/shareDialogRedux';
import {AllPublishableProjectTypes} from '../util/sharedConstants';

export function shareProject(shareUrl) {
  // (x) get createdat from redux (maybe set when we hit /v3/channels on page load (or now?)
  // hourofcode status of project? checking with sam on what an hour of code project is
  // (x) user created at date
  // we'll need these checks on back end, so maybe easier just to manage all of the timestamp
  // work there. maybe we make an endpoint that checks account age / project age to use here to
  // enable/disable ui,
  // and can reuse logic on backend to actually prevent save

  dashboard.project.getChannelMetadata(
    dashboard.project.getCurrentId(),
    (_, data) => console.log(data)
  );

  console.log(getStore().getState().currentUser.createdAt);

  dashboard.project.saveIfSourcesChanged().then(() => {
    var dialogDom = document.getElementById('project-share-dialog');
    if (!dialogDom) {
      dialogDom = document.createElement('div');
      dialogDom.setAttribute('id', 'project-share-dialog');
      document.body.appendChild(dialogDom);
    }

    const appType = dashboard.project.getStandaloneApp();
    const selectedSong = dashboard.project.getSelectedSong();

    // The AgeDialog used by Dance Party stores an 'ad_anon_over13' cookie for signed out users,
    // so we want to use that when we decide whether the user can share their project via social media.
    const pageConstants = getStore().getState().pageConstants;
    let canShareSocial;
    if (appType === 'dance') {
      const is13Plus = sessionStorage.getItem('ad_anon_over13') === 'true';
      canShareSocial =
        pageConstants.is13Plus || (!pageConstants.isSignedIn && is13Plus);
    } else {
      canShareSocial = pageConstants.is13Plus || !pageConstants.isSignedIn;
    }

    // Allow publishing for any project type that students can publish.
    // Younger students can now get to the share dialog if their teacher allows
    // it. ShareAllowedDialog will disable publishing, even if canPublish is true,
    // if the project is in restricted share mode.
    const canPublish =
      !!appOptions.isSignedIn && AllPublishableProjectTypes.includes(appType);

    ReactDOM.render(
      <Provider store={getStore()}>
        <ShareDialog
          isProjectLevel={!!dashboard.project.isProjectLevel()}
          allowSignedOutShare={appType === 'dance'}
          shareUrl={shareUrl}
          selectedSong={selectedSong}
          thumbnailUrl={dashboard.project.getThumbnailUrl()}
          isAbusive={dashboard.project.exceedsAbuseThreshold()}
          canPrint={appType === 'artist'}
          canPublish={canPublish}
          isPublished={dashboard.project.isPublished()}
          channelId={dashboard.project.getCurrentId()}
          appType={appType}
          onClickPopup={popupWindow}
          canShareSocial={canShareSocial}
          userSharingDisabled={appOptions.userSharingDisabled}
        />
      </Provider>,
      dialogDom
    );

    getStore().dispatch(showShareDialog());
  });
}
