import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import Button from '@cdo/apps/templates/Button';
import TopCourse from '@cdo/apps/templates/studioHomepages/TopCourse';
import i18n from '@cdo/locale';

// eslint-disable-next-line no-restricted-imports
import {
  // assert,
  expect,
} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

import {topCourse} from './homepagesTestData';

describe('TopCourse', () => {
  const store = createStore(combineReducers({isRtl}));

  it('renders a TopCourse with 2 buttons', () => {
    const wrapper = mount(
      <Provider store={store}>
        <TopCourse
          assignableName={topCourse.assignableName}
          lessonName={topCourse.lessonName}
          linkToOverview={topCourse.linkToOverview}
          linkToLesson={topCourse.linkToLesson}
        />
      </Provider>
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <div>{topCourse.assignableName}</div>
          <div>
            <div>You are currently working on {topCourse.lessonName}.</div>
            <div>{i18n.topCourseExplanation()}</div>
          </div>
          <div>
            <Button
              __useDeprecatedTag
              href={topCourse.linkToOverview}
              text="View course"
            />
            <Button
              __useDeprecatedTag
              href={topCourse.linkToLesson}
              text="Continue lesson"
            />
          </div>
        </div>
      )
    );
  });

  // TODO: for now we switched off this functionality. However once we turn this back on we'll need to make this test
  // TODO: working again
  // it('shows blue image when it is a professional learning course', () => {
  //   const wrapper = mount(
  //     <Provider store={store}>
  //       <TopCourse
  //         assignableName={topCourse.assignableName}
  //         lessonName={topCourse.lessonName}
  //         linkToOverview={topCourse.linkToOverview}
  //         linkToLesson={topCourse.linkToLesson}
  //         isProfessionalLearningCourse={true}
  //       />
  //     </Provider>
  //   );
  //
  //   assert.include(
  //     wrapper.find('img').props().src,
  //     'small_blue_icons_fullwidth'
  //   );
  // });
  //
  // it('shows purple image when it is a student facing course', () => {
  //   const wrapper = mount(
  //     <Provider store={store}>
  //       <TopCourse
  //         assignableName={topCourse.assignableName}
  //         lessonName={topCourse.lessonName}
  //         linkToOverview={topCourse.linkToOverview}
  //         linkToLesson={topCourse.linkToLesson}
  //       />
  //     </Provider>
  //   );
  //
  //   assert.include(
  //     wrapper.find('img').props().src,
  //     'small_purple_icons_fullwidth'
  //   );
  // });
});
