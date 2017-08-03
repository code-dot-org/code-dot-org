import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import queryString from 'query-string';
import $ from 'jquery';
import { getStore, registerReducers } from '@cdo/apps/redux';
import teacherSections, {
  setValidLoginTypes,
  setValidGrades,
  setStudioUrl,
  setOAuthProvider,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import oauthClassroom from '@cdo/apps/templates/teacherDashboard/oauthClassroomRedux';
import SectionsPage from '@cdo/apps/templates/teacherDashboard/SectionsPage';

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
  const element = document.getElementById('sections-page');
  registerReducers({teacherSections, oauthClassroom});
  const store = getStore();

  store.dispatch(setStudioUrl(data.studiourlprefix));
  store.dispatch(setValidLoginTypes(data.valid_login_types));
  store.dispatch(setValidGrades(data.valid_grades));
  store.dispatch(setOAuthProvider(data.provider));

  const query = queryString.parse(window.location.search);
  let defaultCourseId;
  let defaultScriptId;
  if (query.courseId) {
    defaultCourseId = parseInt(query.courseId, 10);
  }
  if (query.scriptId) {
    defaultScriptId = parseInt(query.scriptId, 10);
  }

  $("#sections-page-angular").hide();

  ReactDOM.render(
    <Provider store={store}>
      <SectionsPage
        validScripts={data.valid_scripts}
        defaultCourseId={defaultCourseId}
        defaultScriptId={defaultScriptId}
      />
    </Provider>,
    element
  );
}
