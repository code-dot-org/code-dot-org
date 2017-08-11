import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import teacherSections, {
  setOAuthProvider,
  asyncLoadSectionData,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';
import logToCloud from '@cdo/apps/logToCloud';
import LoginTypeParagraph from '@cdo/apps/templates/teacherDashboard/LoginTypeParagraph';

/**
 * Render our sections table using React
 * @param {Object} data - A collection of data we get from the server as part of
 *   page load
 * @param {string} data.studiourlprefix
 * @param {string[]} data.valid_login_types
 * @param {string[]} data.valid_grades
 * @param {object[]} data.valid_scripts
 */
export function renderSectionsPage(data) {
  logToCloud.addPageAction(logToCloud.PageAction.PegasusSectionsRedirect, {});
  window.location = data.studiourlprefix + '/home';
}

/**
 * Unmount the React root mounted by renderSectionsPage.
 */
export function unmountSectionsPage() {
  const element = document.getElementById('sections-page');
  ReactDOM.unmountComponentAtNode(element);
}

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

/**
 * Render the login type details and controls for changing login type
 * at the bottom of the manage students tab.
 * @param {sectionShape} section
 */
export function renderLoginTypeControls(section) {
  registerReducers({teacherSections});
  const store = getStore();

  store.dispatch(asyncLoadSectionData());

  ReactDOM.render(
    <Provider store={store}>
      <LoginTypeParagraph
        sectionId={section.id}
        onLoginTypeChanged={() => window.location.reload()}
      />
    </Provider>,
    loginTypeControlsMountPoint()
  );
}

export function unmountLoginTypeControls() {
  ReactDOM.unmountComponentAtNode(loginTypeControlsMountPoint());
}

function loginTypeControlsMountPoint() {
  return document.getElementById('login-type-react');
}
