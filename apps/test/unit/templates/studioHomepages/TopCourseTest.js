import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import i18n from "@cdo/locale";
import TopCourse from '@cdo/apps/templates/studioHomepages/TopCourse';
import Button from '@cdo/apps/templates/Button';
import { topCourse } from './homepagesTestData';
import { combineReducers, createStore } from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

describe('TopCourse', () => {
  const store = createStore(combineReducers({isRtl}));

  it('renders a TopCourse with 2 buttons', () => {
    const wrapper = shallow(
      <TopCourse
        assignableName={topCourse.assignableName}
        lessonName={topCourse.lessonName}
        linkToOverview={topCourse.linkToOverview}
        linkToLesson={topCourse.linkToLesson}
      />, {context: {store}},
    ).dive();
    expect(wrapper).to.containMatchingElement(
      <div>
        <img/>
        <div>
          {topCourse.assignableName}
        </div>
        <div>
          <div>
            You are currently working on {topCourse.lessonName}.
          </div>
          <div>
            {i18n.topCourseExplanation()}
          </div>
        </div>
        <div>
          <Button
            href={topCourse.linkToOverview}
            text="View course"
          />
          <Button
            href={topCourse.linkToLesson}
            text="Continue lesson"
          />
        </div>
      </div>
    );
  });
});
