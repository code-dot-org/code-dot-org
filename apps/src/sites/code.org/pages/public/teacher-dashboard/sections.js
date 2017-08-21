import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import teacherSections, {
  setOAuthProvider,
  asyncLoadSectionData,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';

/**
 * On the manage students tab of an oauth section, use React to render a button
 * that will re-sync an OmniAuth section's roster.
 * @param {number} sectionId
 * @param {OAuthSectionTypes} provider
 */
export function renderSyncOauthSectionControl({sectionId, provider}) {
  registerReducers({teacherSections});
  const store = getStore();

  store.dispatch(setOAuthProvider(provider));
  store.dispatch(asyncLoadSectionData());

  ReactDOM.render(
    <Provider store={store}>
      <SyncOmniAuthSectionControl sectionId={sectionId}/>
    </Provider>,
    syncOauthSectionMountPoint()
  );
}

export function unmountSyncOauthSectionControl() {
  ReactDOM.unmountComponentAtNode(syncOauthSectionMountPoint());
}

function syncOauthSectionMountPoint() {
  return document.getElementById('react-sync-oauth-section');
}
