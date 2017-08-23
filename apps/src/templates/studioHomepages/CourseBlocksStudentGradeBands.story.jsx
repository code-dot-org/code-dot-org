import React from 'react';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';

registerReducers({isRtl: isRtlReducer});
const store = getStore();

export default storybook => storybook
  .storiesOf('CourseBlocksStudentGradeBands', module)
  .addStoryTable([
    {
      name: 'course blocks - student grade bands',
      description: `This is a set of course blocks listing student grade bands`,
      story: () => (
        <Provider store={store}>
          <CourseBlocksStudentGradeBands/>
        </Provider>
      )
    },
  ]);
