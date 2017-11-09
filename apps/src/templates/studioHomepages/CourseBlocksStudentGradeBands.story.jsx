import React from 'react';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsive from '../../code-studio/responsiveRedux';
import isRtl from '../../code-studio/isRtlRedux';

export default storybook => {
  const store = createStore(combineReducers({responsive, isRtl}));
  return storybook
    .storiesOf('CourseBlocksStudentGradeBands', module)
    .addStoryTable([
      {
        name: 'course blocks - student grade bands',
        description: `This is a set of course blocks listing student grade bands`,
        story: () => (
          <Provider store={store}>
            <CourseBlocksStudentGradeBands
              showContainer={true}
              hideBottomMargin={false}
            />
          </Provider>
        )
      },
    ]);
};
