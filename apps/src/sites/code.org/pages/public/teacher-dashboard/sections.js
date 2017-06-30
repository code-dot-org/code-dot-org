import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import queryString from 'query-string';
import { getStore, registerReducers } from '@cdo/apps/redux';
import teacherSections, {
  setValidLoginTypes,
  setValidGrades,
  setValidAssignments,
  setStudioUrl,
  newSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import googleClassroom from '@cdo/apps/templates/teacherDashboard/googleClassroomRedux';
import SectionsPage from '@cdo/apps/templates/teacherDashboard/SectionsPage';

/**
 * Render our sections table using React
 * @param {Object} data - A collection of data we get from the server as part of
 *   page load
 * @param {string} data.studiourlprefix
 * @param {string[]} data.valid_login_types
 * @param {string[]} data.valid_Grades
 * @param {object[]} data.valid_courses
 * @param {object[]} data.valid_scripts
 */
export function renderSectionsPage(data) {
  const element = document.getElementById('sections-page');
  registerReducers({teacherSections, googleClassroom});
  const store = getStore();
  store.dispatch(setStudioUrl(data.studiourlprefix));
  store.dispatch(setValidLoginTypes(data.valid_login_types));
  store.dispatch(setValidGrades(data.valid_grades));
  store.dispatch(setValidAssignments(data.valid_courses, data.valid_scripts));

  const query = queryString.parse(window.location.search);
  if (query.newSection) {
    const courseId = parseInt(query.newSection, 10);
    store.dispatch(newSection(courseId));
  }

  $("#sections-page-angular").hide();

  ReactDOM.render(
    <Provider store={store}>
      <SectionsPage/>
    </Provider>,
    element
  );
}
