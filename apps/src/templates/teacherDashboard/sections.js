import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import teacherSections, {
  setOAuthProvider,
  asyncLoadSectionData
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';
import LoginTypeParagraph from '@cdo/apps/templates/teacherDashboard/LoginTypeParagraph';
import SectionsSharingButton from '@cdo/apps/templates/teacherDashboard/SectionsSharingButton';
import ManageStudentsTable from '@cdo/apps/templates/manageStudents/ManageStudentsTable';

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

export function renderSectionTable(sectionId, loginType) {
  const dataUrl = `/v2/sections/${sectionId}/students`;
  const element = document.getElementById('student-table-react');

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
  }).done(studentData => {
    studentData = studentData.map((student) => {
      return {
        id: student.id,
        name: student.name,
        username: student.username,
        age: student.age,
        gender: student.gender,
        secretWords: student.secret_words,
        secretPicturePath: student.secret_picture_path,
        sectionId: sectionId,
        loginType: loginType,
      };
    });
    ReactDOM.render(
      <ManageStudentsTable
        studentData={studentData}
        id={sectionId}
        loginType={loginType}
      />,
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
