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
  searchOptions
} from '../../../../test/unit/lib/levelbuilder/lesson-editor/activitiesTestData';

const createStore = () => {
  registerReducers({...reducers, resources: resourcesEditor});
  const store = createStoreWithReducers();
  store.dispatch(init(sampleActivities, searchOptions));
  store.dispatch(initResources([]));
  return store;
};
export default storybook => {
  storybook.storiesOf('ActivitiesEditor', module).addStoryTable([
    {
      name: 'ActivitiesEditor For Lesson With Lesson Plan',
      story: () => (
        <Provider store={createStore()}>
          <ActivitiesEditor hasLessonPlan={true} />
        </Provider>
      )
    },
    {
      name: 'ActivitiesEditor For Lesson Without Lesson Plan',
      story: () => (
        <Provider store={createStore()}>
          <ActivitiesEditor hasLessonPlan={false} />
        </Provider>
      )
    }
  ]);
};
