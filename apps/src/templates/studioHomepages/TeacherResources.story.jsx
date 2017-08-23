import React from 'react';
import TeacherResources from './TeacherResources';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';

registerReducers({isRtl: isRtlReducer});
const store = getStore();

export default storybook => {
  return storybook
    .storiesOf('TeacherResources', module)
    .addStoryTable([
      {
        name: 'Resources for teachers',
        description: `This is the TeacherResources section that will be used on the teacher homepage.`,
        story: () => (
          <Provider store={store}>
            <TeacherResources
              isRtl={false}
            />
          </Provider>
        )
      }
    ]);
};
