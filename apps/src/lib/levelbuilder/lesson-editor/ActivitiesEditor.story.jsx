import React from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init
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

const resourcesEditor = createResourcesReducer('lessonResource');

const createStoreWithLessonPlan = () => {
  registerReducers({
    ...reducers,
    resources: resourcesEditor,
    vocabularies: vocabulariesEditor
  });
  const store = createStoreWithReducers();
  store.dispatch(init(sampleActivities, searchOptions, [], false));
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
  store.dispatch(
    init([sampleActivityForLessonWithoutLessonPlan], searchOptions, [], false)
  );
  store.dispatch(initResources('lessonResource', []));
  store.dispatch(initVocabularies([]));
  return store;
};
export default storybook => {
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
