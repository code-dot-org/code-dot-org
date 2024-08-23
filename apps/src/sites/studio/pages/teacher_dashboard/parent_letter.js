import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import currentUser, {
  setCurrentUserName,
} from '@cdo/apps/templates/currentUserRedux';
import ParentLetter from '@cdo/apps/templates/teacherDashboard/ParentLetter';
import teacherSections, {
  selectSection,
  setSections,
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const script = document.querySelector('script[data-json]');
const scriptData = JSON.parse(script.dataset.json);

// Register the reducers we need to show the parent letter:
registerReducers({currentUser, teacherSections});

// Populate the store with data passed down from the server:
const store = getStore();
store.dispatch(setCurrentUserName(scriptData.userName));
store.dispatch(setSections(scriptData.sections));
store.dispatch(selectSection(scriptData.section.id));
store.dispatch(
  setStudentsForCurrentSection(
    scriptData.section.id,
    scriptData.section.students
  )
);

window.addEventListener('DOMContentLoaded', function () {
  // Mount and render the letter:
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);
  ReactDOM.render(
    <Provider store={store}>
      <ParentLetter autoPrint logoUrl={scriptData.logoUrl} />
    </Provider>,
    mountPoint
  );
});
