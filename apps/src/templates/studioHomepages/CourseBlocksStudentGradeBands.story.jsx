import React from 'react';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';
import Responsive from '../../responsive';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsiveRedux from '../../code-studio/responsiveRedux';

const responsive = new Responsive();

export default storybook => {
  const store = createStore(combineReducers({responsive: responsiveRedux}));
  return storybook
    .storiesOf('CourseBlocksStudentGradeBands', module)
    .addStoryTable([
      {
        name: 'course blocks - student grade bands',
        description: `This is a set of course blocks listing student grade bands`,
        story: () => (
          <Provider store={store}>
            <CourseBlocksStudentGradeBands
              isRtl={false}
              responsive={responsive}
              showContainer={true}
              hideBottomMargin={false}
            />
          </Provider>
        )
      },
    ]);
};
