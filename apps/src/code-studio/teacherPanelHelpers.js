import queryString from 'query-string';
import {setSectionLockStatus} from './lessonLockRedux';
import {
  setSections,
  selectSection
} from '../templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import {setStudentsForCurrentSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import TeacherPanel from './components/progress/teacherPanel/TeacherPanel';
import $ from 'jquery';
import {queryParams} from '@cdo/apps/code-studio/utils';

/**
 * Render our teacher panel that shows up on our course overview page.
 */
export function renderTeacherPanel(
  store,
  scriptId,
  scriptName,
  pageType = null
) {
  const div = document.createElement('div');
  div.setAttribute('id', 'teacher-panel-container');

  queryStudentsForSection(store);
  queryLockStatus(store, scriptId, pageType);

  ReactDOM.render(
    <Provider store={store}>
      <TeacherPanel unitName={scriptName} pageType={pageType} />
    </Provider>,
    div
  );
  document.body.appendChild(div);
}

/**
 * Query the server for lock status of this teacher's students
 * @returns {Promise} when finished
 */
function queryLockStatus(store, scriptId, pageType) {
  return new Promise((resolve, reject) => {
    $.ajax('/api/lock_status', {
      data: {script_id: scriptId}
    }).done(data => {
      // Extract the state that teacherSectionsRedux cares about
      const teacherSections = Object.values(data).map(section => ({
        id: section.section_id,
        name: section.section_name
      }));

      // Don't dispatch setSections on script overview pages because setSections
      // has already been dispatched on those pages with data specific to which
      // sections are assigned to the script for the TeacherSectionSeletor.
      if (pageType !== 'script_overview') {
        store.dispatch(setSections(teacherSections));
        const query = queryString.parse(location.search);
        if (query.section_id) {
          store.dispatch(selectSection(query.section_id));
        }
      }

      store.dispatch(setSectionLockStatus(data));
      resolve();
    });
  });
}

function queryStudentsForSection(store) {
  const sectionId = queryParams('section_id');

  let request = '/api/teacher_panel_section';
  if (sectionId) {
    request += `?section_id=${sectionId}`;
  }

  $.ajax(request)
    .success((section, status) => {
      if (status !== 'nocontent') {
        store.dispatch(
          setStudentsForCurrentSection(section.id, section.students)
        );
      }
    })
    .fail(err => {
      console.log(err);
    });
}
