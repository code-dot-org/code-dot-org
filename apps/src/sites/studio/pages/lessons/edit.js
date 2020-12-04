import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import {getStore, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init,
  emptyActivity
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import resourcesEditor, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import {Provider} from 'react-redux';
import _ from 'lodash';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

$(document).ready(function() {
  const lessonData = getScriptData('lesson');
  const relatedLessons = getScriptData('relatedLessons');
  const searchOptions = getScriptData('searchOptions');

  const activities = lessonData.activities;
  const objectives = lessonData.objectives || [];

  // Rename any keys that are different on the backend.
  activities.forEach(activity => {
    // React key which must be unique for each object in the list. React
    // recommends against using the array index for this. We don't want to use
    // the id column directly, because when we create new objects, we want to
    // be able specify a react key while leaving the id field blank.
    //
    // This is a quirk due to the fact that we are not actually posting to the
    // server to get a new object id at the time a new object is created in the
    // UI. If we start doing that, then we should be able to get into a state
    // where every object has an id, and this key field should become unneeded.
    activity.key = activity.id + '';

    activity.displayName = activity.name || '';
    delete activity.name;

    activity.duration = activity.duration || '';

    activity.activitySections.forEach(activitySection => {
      // React key
      activitySection.key = activitySection.id + '';

      activitySection.displayName = activitySection.name || '';
      delete activitySection.name;

      activitySection.text = activitySection.description || '';
      delete activitySection.description;

      activitySection.scriptLevels = activitySection.scriptLevels || [];
      activitySection.scriptLevels.forEach(scriptLevel => {
        scriptLevel.status = LevelStatus.not_tried;

        // The position within the lesson
        scriptLevel.levelNumber = scriptLevel.position;

        // The position within the activity section
        scriptLevel.position = scriptLevel.activitySectionPosition;

        delete scriptLevel.activitySectionPosition;
      });

      activitySection.tips = activitySection.tips || [];

      activitySection.tips.forEach(tip => {
        // React key
        tip.key = _.uniqueId();
      });
    });
  });

  if (activities.length === 0) {
    activities.push(emptyActivity);
  }

  // Do the same thing for objective keys as for activity keys above.
  // React needs unique keys for all objects, but objectives don't get
  // a key until they're saved to the server, which happens after lesson save.
  objectives.forEach(objective => (objective.key = objective.id + ''));

  registerReducers({...reducers, resources: resourcesEditor});
  const store = getStore();

  store.dispatch(init(activities, searchOptions));
  store.dispatch(initResources(lessonData.resources || []));

  ReactDOM.render(
    <Provider store={store}>
      <LessonEditor
        id={lessonData.id}
        initialDisplayName={lessonData.name}
        initialOverview={lessonData.overview || ''}
        initialStudentOverview={lessonData.studentOverview || ''}
        initialAssessmentOpportunities={
          lessonData.assessmentOpportunities || ''
        }
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
