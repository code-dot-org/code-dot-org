import React from 'react';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsive from '../../code-studio/responsiveRedux';
import isRtl from '../../code-studio/isRtlRedux';

export default storybook => {
  const store = createStore(combineReducers({responsive, isRtl}));
  return storybook
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
};
