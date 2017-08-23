import React from 'react';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';

registerReducers({isRtl: isRtlReducer});
const store = getStore();

export default storybook => storybook
  .storiesOf('CourseBlocksTeacherGradeBands', module)
  .addStoryTable([
    {
      name: 'course blocks - grade bands',
      description: `This is a set of course blocks listing teacher grade bands`,
      story: () => (
        <Provider store={store}>
          <CourseBlocksTeacherGradeBands/>
        </Provider>
      )
    },
  ]);
