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
  asyncLoadSectionData,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import SectionsPage from '@cdo/apps/templates/teacherDashboard/SectionsPage';
import experiments, { SECTION_FLOW_2017 } from '@cdo/apps/util/experiments';
import logToCloud from '@cdo/apps/logToCloud';

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
  if (experiments.isEnabled(SECTION_FLOW_2017)) {
    logToCloud.addPageAction(logToCloud.PageAction.PegasusSectionsRedirect, {});
    window.location = data.studiourlprefix + '/home';
    return;
  }

  const element = document.getElementById('sections-page');
  registerReducers({teacherSections});
  const store = getStore();

  store.dispatch(setStudioUrl(data.studiourlprefix));
  store.dispatch(setValidLoginTypes(data.valid_login_types));
  store.dispatch(setValidGrades(data.valid_grades));
  store.dispatch(setOAuthProvider(data.provider));
  store.dispatch(asyncLoadSectionData());

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
        defaultCourseId={defaultCourseId}
        defaultScriptId={defaultScriptId}
      />
    </Provider>,
    element
  );
}

/**
 * Unmount the React root mounted by renderSectionsPage.
 */
export function unmountSectionsPage() {
  const element = document.getElementById('sections-page');
  ReactDOM.unmountComponentAtNode(element);
}
