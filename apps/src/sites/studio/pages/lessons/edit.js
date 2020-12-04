import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import {getStore, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init,
  mapActivityDataForEditor
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import resourcesEditor, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import {Provider} from 'react-redux';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');
  const relatedLessons = getScriptData('relatedLessons');
  const searchOptions = getScriptData('searchOptions');
  const levelKeyList = getScriptData('levelKeyList');

  const activities = mapActivityDataForEditor(lessonData.activities);
  const objectives = lessonData.objectives || [];

  // Do the same thing for objective keys as for activity keys above.
  // React needs unique keys for all objects, but objectives don't get
  // a key until they're saved to the server, which happens after lesson save.
  objectives.forEach(objective => (objective.key = objective.id + ''));

  registerReducers({...reducers, resources: resourcesEditor});
  const store = getStore();

  store.dispatch(init(activities, levelKeyList, searchOptions));
  store.dispatch(initResources(lessonData.resources || []));

  ReactDOM.render(
    <Provider store={store}>
      <LessonEditor
        id={lessonData.id}
        initialDisplayName={lessonData.name}
        initialOverview={lessonData.overview || ''}
        initialStudentOverview={lessonData.studentOverview || ''}
        initialUnplugged={lessonData.unplugged}
        initialLockable={lessonData.lockable}
        initialCreativeCommonsLicense={lessonData.creativeCommonsLicense}
        initialAssessment={lessonData.assessment}
        initialPurpose={lessonData.purpose || ''}
        initialPreparation={lessonData.preparation || ''}
        initialAnnouncements={lessonData.announcements || []}
        relatedLessons={relatedLessons}
        initialObjectives={objectives}
        courseVersionId={lessonData.courseVersionId}
      />
    </Provider>,
    document.getElementById('edit-container')
  );
});
