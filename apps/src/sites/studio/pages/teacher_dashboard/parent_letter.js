import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import teacherSections, {
  selectSection,
  setSections
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import currentUser, {
  setCurrentUserName
} from '@cdo/apps/templates/currentUserRedux';
import {setPegasusOrigin, setStudioOrigin} from '@cdo/apps/lib/util/urlHelpers';
import ParentLetter from '@cdo/apps/lib/ui/ParentLetter';

const script = document.querySelector('script[data-json]');
const scriptData = JSON.parse(script.dataset.json);

// Capture base URLs for both dashboard and pegasus since we want
// absolute URLs for both in the letter we generate.
setPegasusOrigin(scriptData.pegasusOrigin);
setStudioOrigin(scriptData.studioOrigin);

// Register the reducers we need to show the parent letter:
registerReducers({currentUser, sectionData, teacherSections});

// Populate the store with data passed down from the server:
const store = getStore();
store.dispatch(setCurrentUserName(scriptData.userName));
store.dispatch(setSections(scriptData.sections));
store.dispatch(setSection(scriptData.section));
store.dispatch(selectSection(scriptData.section.id));

window.addEventListener('DOMContentLoaded', function() {
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
