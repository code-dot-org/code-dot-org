import React from 'react';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';
import Responsive from '../../responsive';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsiveRedux from '../../code-studio/responsiveRedux';

const responsive = new Responsive();

export default storybook => {
  const store = createStore(combineReducers({responsive: responsiveRedux}));
  return storybook
    .storiesOf('CourseBlocksTeacherGradeBands', module)
    .addStoryTable([
      {
        name: 'course blocks - grade bands',
        description: `This is a set of course blocks listing teacher grade bands`,
        story: () => (
          <Provider store={store}>
            <CourseBlocksTeacherGradeBands
              isRtl={false}
              responsive={responsive}
            />
          </Provider>
        )
      },
    ]);
};
