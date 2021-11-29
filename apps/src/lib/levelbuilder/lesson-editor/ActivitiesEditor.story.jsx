import React from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import reducers, {
  initActivities,
  initLevelSearching
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import createResourcesReducer, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import vocabulariesEditor, {
  initVocabularies
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {Provider} from 'react-redux';
import {
  sampleActivities,
  sampleActivityForLessonWithoutLessonPlan,
  searchOptions
} from '../../../../test/unit/lib/levelbuilder/lesson-editor/activitiesTestData';
import {allowConsoleWarnings} from '../../../../test/util/testUtils';

const resourcesEditor = createResourcesReducer('lessonResource');

const createStoreWithLessonPlan = () => {
  registerReducers({
    ...reducers,
    resources: resourcesEditor,
    vocabularies: vocabulariesEditor
  });
  const store = createStoreWithReducers();
  store.dispatch(initActivities(sampleActivities));
  store.dispatch(
    initLevelSearching({
      searchOptions: searchOptions,
      programmingEnvironments: []
    })
  );
  store.dispatch(initResources('lessonResource', []));
  store.dispatch(initVocabularies([]));
  return store;
};

const createStoreWithoutLessonPlan = () => {
  registerReducers({
    ...reducers,
    resources: resourcesEditor,
    vocabularies: vocabulariesEditor
  });
  const store = createStoreWithReducers();
  store.dispatch(initActivities([sampleActivityForLessonWithoutLessonPlan]));
  store.dispatch(
    initLevelSearching({
      searchOptions: searchOptions,
      programmingEnvironments: []
    })
  );
  store.dispatch(initResources('lessonResource', []));
  store.dispatch(initVocabularies([]));
  return store;
};

export default storybook => {
  if (IN_UNIT_TEST) {
    allowConsoleWarnings();
  }

  storybook.storiesOf('ActivitiesEditor', module).addStoryTable([
    {
      name: 'ActivitiesEditor For Lesson With Lesson Plan',
      story: () => (
        <Provider store={createStoreWithLessonPlan()}>
          <ActivitiesEditor hasLessonPlan={true} />
        </Provider>
      )
    },
    {
      name: 'ActivitiesEditor For Lesson Without Lesson Plan',
      story: () => (
        <Provider store={createStoreWithoutLessonPlan()}>
          <ActivitiesEditor hasLessonPlan={false} />
        </Provider>
      )
    }
  ]);
};
