import React from 'react';
import CourseBlocksTools from './CourseBlocksTools';
import Responsive from '../../responsive';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsiveRedux from '../../code-studio/responsiveRedux';

const responsive = new Responsive();

export default storybook => {
  const store = createStore(combineReducers({responsive: responsiveRedux}));
  return storybook
    .storiesOf('CourseBlocksTools', module)
    .addStoryTable([
      {
        name: 'course blocks - tools',
        description: `This is a set of course blocks listing tools`,
        story: () => (
          <Provider store={store}>
            <CourseBlocksTools
              isEnglish={true}
              isRtl={false}
              responsive={responsive}
            />
          </Provider>
        )
      },
    ]);
};
