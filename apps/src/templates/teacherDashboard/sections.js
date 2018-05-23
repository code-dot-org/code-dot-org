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
  setStudents,
  convertStudentServerData,
  toggleSharingColumn,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import textResponses, {asyncLoadTextResponses} from '@cdo/apps/templates/textResponses/textResponsesRedux';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';
import ManageStudentsTable from '@cdo/apps/templates/manageStudents/ManageStudentsTable';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import StatsTable from '@cdo/apps/templates/teacherDashboard/StatsTable';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';
import scriptSelection, { loadValidScripts } from '@cdo/apps/redux/scriptSelectionRedux';

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

  registerReducers({textResponses, scriptSelection, sectionData});
  const store = getStore();
  store.dispatch(setSection(section));
  store.dispatch(loadValidScripts(section, validScripts));

  const scriptId = store.getState().scriptSelection.scriptId;
  store.dispatch(asyncLoadTextResponses(section.id, scriptId, () => {
    ReactDOM.render(
      <Provider store={store}>
        <TextResponses sectionId={section.id}/>
      </Provider>,
      element
    );
  }));
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

export function renderSectionTable(section, studioUrlPrefix,) {
  registerReducers({teacherSections, manageStudents, isRtl, sectionData});
  const store = getStore();

  store.dispatch(setLoginType(section.login_type));
  store.dispatch(asyncLoadSectionData(section.id));
  store.dispatch(setSection(section));

  // Show share column by default for CSD and CSP courses.
  // TODO(dave): remove 'csd' and 'csp' once they have been renamed to their 2017 versions.
  const coursesToShowShareSetting = ['csd', 'csd-2017', 'csd-2018', 'csp', 'csp-2017', 'csp-2018'];
  if (coursesToShowShareSetting.includes(section.course_name)) {
    store.dispatch(toggleSharingColumn());
  }

  const dataUrl = `/dashboardapi/sections/${section.id}/students`;
  const element = document.getElementById('student-table-react');

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
  }).done(studentData => {
    store.dispatch(
      setStudents(convertStudentServerData(studentData, section.login_type, section.id))
    );
    ReactDOM.render(
      <Provider store={store}>
        <ManageStudentsTable
          studioUrlPrefix={studioUrlPrefix}
        />
      </Provider>,
      element);
  });
}
