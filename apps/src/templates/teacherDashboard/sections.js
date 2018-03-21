import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import teacherSections, {
  setOAuthProvider,
  asyncLoadSectionData
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import manageStudents, {
  setLoginType,
  setSectionId,
  setStudents,
  convertStudentServerData,
  toggleSharingColumn,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';
import LoginTypeParagraph from '@cdo/apps/templates/teacherDashboard/LoginTypeParagraph';
import SectionsSharingButton from '@cdo/apps/templates/teacherDashboard/SectionsSharingButton';
import ManageStudentsTable from '@cdo/apps/templates/manageStudents/ManageStudentsTable';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import experiments from '@cdo/apps/util/experiments';

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
  store.dispatch(asyncLoadSectionData(sectionId));

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
 * @param {number} sectionId
 */
export function renderLoginTypeAndSharingControls(sectionId) {
  registerReducers({teacherSections});
  const store = getStore();

  store.dispatch(asyncLoadSectionData(sectionId));

  ReactDOM.render(
    <Provider store={store}>
      <LoginTypeParagraph
        sectionId={sectionId}
        onLoginTypeChanged={() => window.location.reload()}
      />
    </Provider>,
    loginTypeControlsMountPoint()
  );
  ReactDOM.render(
    <Provider store={store}>
      <SectionsSharingButton
        sectionId={sectionId}
      />
    </Provider>,
    shareSettingMountPoint()
  );
}

export function renderSectionTable(sectionId, loginType, courseName) {
  registerReducers({manageStudents, isRtl});
  const store = getStore();

  store.dispatch(setLoginType(loginType));
  store.dispatch(setSectionId(sectionId));

  const showShareColumn = experiments.isEnabled(experiments.SHARE_COLUMN);

  // Show share column by default for CSD and CSP courses
  const coursesToShowShareSetting = ['csd', 'csp'];
  if (showShareColumn && coursesToShowShareSetting.includes(courseName)) {
    store.dispatch(toggleSharingColumn());
  }

  const dataUrl = `/dashboardapi/sections/${sectionId}/students`;
  const element = document.getElementById('student-table-react');

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
  }).done(studentData => {
    store.dispatch(
      setStudents(convertStudentServerData(studentData, loginType, sectionId))
    );
    ReactDOM.render(
      <Provider store={store}>
        <ManageStudentsTable />
      </Provider>,
      element);
  });
}

export function unmountLoginTypeAndSharingControls() {
  ReactDOM.unmountComponentAtNode(loginTypeControlsMountPoint());
  ReactDOM.unmountComponentAtNode(shareSettingMountPoint());
}

function loginTypeControlsMountPoint() {
  return document.getElementById('login-type-react');
}

function shareSettingMountPoint() {
  return document.getElementById('share-setting-react');
}
