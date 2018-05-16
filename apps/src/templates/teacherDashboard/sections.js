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
import sectionProgress, {setSection, setValidScripts} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import textResponses, {asyncLoadTextResponses, setSectionId as textResponsesSetSectionId} from '@cdo/apps/templates/textResponses/textResponsesRedux';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';
import ManageStudentsTable from '@cdo/apps/templates/manageStudents/ManageStudentsTable';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import StatsTable from '@cdo/apps/templates/teacherDashboard/StatsTable';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';

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

export function renderTextResponsesTable(section, validScripts) {
  const element = document.getElementById('text-responses-table-react');

  registerReducers({sectionProgress, textResponses});
  const store = getStore();
  // data from setSection and setValidScripts (line 100) required on multiple tabs
  // TODO (madelynkasula): refactor multi-tab data into common reducer
  store.dispatch(setSection(section));
  store.dispatch(textResponsesSetSectionId(section.id));

  const promises = [
    $.ajax({
      method: 'GET',
      url: `/dashboardapi/sections/${section.id}/student_script_ids`,
      dataType: 'json'
    }),
    $.ajax({
      method: 'GET',
      url: `/dashboardapi/courses?allVersions=1`,
      dataType: 'json'
    })
  ];

  Promise.all(promises).then(data => {
    let [studentScriptsData, validCourses] = data;
    store.dispatch(setValidScripts(validScripts, studentScriptsData.studentScriptIds, validCourses));
    const scriptId = store.getState().sectionProgress.scriptId;

    store.dispatch(asyncLoadTextResponses(section.id, scriptId, () => {
      ReactDOM.render(
        <Provider store={store}>
          <TextResponses sectionId={section.id}/>
        </Provider>,
        element
      );
    }));
  });
}

export function renderStatsTable(section) {
  const dataUrl = `/dashboardapi/sections/${section.id}/students/completed_levels_count`;
  const element = document.getElementById('stats-table-react');

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
  }).done(studentsCompletedLevelCount => {
    ReactDOM.render(
      <StatsTable
        section={section}
        studentsCompletedLevelCount={studentsCompletedLevelCount}
      />,
      element
    );
  });
}

export function renderSectionTable(sectionId, loginType, courseName) {
  registerReducers({teacherSections, manageStudents, isRtl});
  const store = getStore();

  store.dispatch(setLoginType(loginType));
  store.dispatch(asyncLoadSectionData(sectionId));
  store.dispatch(setSectionId(sectionId));

  // Show share column by default for CSD and CSP courses
  const coursesToShowShareSetting = ['csd', 'csp'];
  if (coursesToShowShareSetting.includes(courseName)) {
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
