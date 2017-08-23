import React from 'react';
import ProjectWidget from './ProjectWidget';
import {generateFakePersonalProjects} from './generateFakePersonalProjects';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';

registerReducers({isRtl: isRtlReducer});
const store = getStore();

export default storybook => {
  storybook
    .storiesOf('ProjectWidget', module)
    .addStoryTable([
      {
        name: 'Project widget',
        description: 'Most recent projects and a set of new projects to start.',
        story: () => (
          <Provider store={store}>
            <ProjectWidget
              projectList={generateFakePersonalProjects(5)}
            />
          </Provider>
        )
      },
    ]);
};
