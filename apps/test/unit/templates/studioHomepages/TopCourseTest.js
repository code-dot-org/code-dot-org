import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import i18n from '@cdo/locale';
import TopCourse from '@cdo/apps/templates/studioHomepages/TopCourse';
import Button from '@cdo/apps/templates/Button';
import {topCourse} from './homepagesTestData';
import {combineReducers, createStore} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

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
          <img />
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
});
