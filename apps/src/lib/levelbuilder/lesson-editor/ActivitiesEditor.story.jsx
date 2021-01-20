import React from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import resourcesEditor, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import {Provider} from 'react-redux';
import {
  sampleActivities,
  sampleActivityForLessonWithoutLessonPlan,
  searchOptions
} from '../../../../test/unit/lib/levelbuilder/lesson-editor/activitiesTestData';

const createStoreWithLessonPlan = () => {
  registerReducers({...reducers, resources: resourcesEditor});
  const store = createStoreWithReducers();
  store.dispatch(init(sampleActivities, searchOptions));
  store.dispatch(initResources([]));
  return store;
};

const createStoreWithoutLessonPlan = () => {
  registerReducers({...reducers, resources: resourcesEditor});
  const store = createStoreWithReducers();
  store.dispatch(
    init([sampleActivityForLessonWithoutLessonPlan], searchOptions)
  );
  store.dispatch(initResources([]));
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
