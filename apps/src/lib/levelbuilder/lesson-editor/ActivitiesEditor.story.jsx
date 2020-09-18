import React from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {Provider} from 'react-redux';
import {
  levelKeyList,
  activities
} from '@cdo/apps/lib/levelbuilder/lesson-editor/SampleActivitiesData';

const createStore = () => {
  registerReducers({...reducers});
  const store = createStoreWithReducers();
  store.dispatch(init(activities, levelKeyList));
  return store;
};
export default storybook => {
  storybook.storiesOf('ActivitiesEditor', module).addStoryTable([
    {
      name: 'ActivitiesEditor',
      story: () => (
        <Provider store={createStore()}>
          <ActivitiesEditor />
        </Provider>
      )
    }
  ]);
};
