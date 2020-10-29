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
  levelKeyList,
  searchOptions
} from '../../../../test/unit/lib/levelbuilder/lesson-editor/activitiesTestData';

const createStore = () => {
  registerReducers({...reducers, resources: resourcesEditor});
  const store = createStoreWithReducers();
  store.dispatch(init(sampleActivities, levelKeyList, searchOptions));
  store.dispatch(initResources([]));
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
