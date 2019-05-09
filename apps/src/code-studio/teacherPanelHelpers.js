import clientState from './clientState';
import queryString from 'query-string';
import {setSectionLockStatus} from './stageLockRedux';
import {
  setSections,
  selectSection
} from '../templates/teacherDashboard/teacherSectionsRedux';

/**
 * Query the server for lock status of this teacher's students
 * @returns {Promise} when finished
 */
export function queryLockStatus(store, scriptId) {
  return new Promise((resolve, reject) => {
    $.ajax('/api/lock_status', {
      data: {
        user_id: clientState.queryParams('user_id'),
        script_id: scriptId
      }
    }).done(data => {
      // Extract the state that teacherSectionsRedux cares about
      const teacherSections = Object.values(data).map(section => ({
        id: section.section_id,
        name: section.section_name
      }));

      store.dispatch(setSections(teacherSections));
      store.dispatch(setSectionLockStatus(data));
      const query = queryString.parse(location.search);
      if (query.section_id) {
        store.dispatch(selectSection(query.section_id));
      }
      resolve();
    });
  });
}
