import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import $ from 'jquery';
import { getStore, registerReducers } from '@cdo/apps/redux';
import teacherSections, {
  setValidLoginTypes,
  setValidGrades,
  setStudioUrl,
  setOAuthProvider,
  asyncLoadSectionData,
  setDefaultAssignment,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
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
  registerReducers({teacherSections});
  const store = getStore();

  store.dispatch(setStudioUrl(data.studiourlprefix));
  store.dispatch(setValidLoginTypes(data.valid_login_types));
  store.dispatch(setValidGrades(data.valid_grades));
  store.dispatch(setOAuthProvider(data.provider));
  store.dispatch(asyncLoadSectionData());
  store.dispatch(setDefaultAssignment());
  console.log('dispatched');

  $("#sections-page-angular").hide();

  ReactDOM.render(
    <Provider store={store}>
      <SectionsPage/>
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
