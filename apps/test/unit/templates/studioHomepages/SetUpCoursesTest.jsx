import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../util/configuredChai';
import SetUpCourses from '@cdo/apps/templates/studioHomepages/SetUpCourses';
import SetUpMessage from '@cdo/apps/templates/studioHomepages/SetUpMessage';

describe('SetUpCourses', () => {
  it('renders as expected for a teacher', () => {
    const wrapper = shallow(
      <SetUpCourses isTeacher={true}/>
    );
    assert(wrapper.containsMatchingElement(
      <SetUpMessage
        type="courses"
        headingText="Start learning"
        descriptionText="Assign a course to your classroom or start your own course."
        buttonText="Find a course"
        buttonUrl="/courses"
      />
    ));
  });

  it('renders as expected for a student', () => {
    const wrapper = shallow(
      <SetUpCourses isTeacher={false}/>
    );
    assert(wrapper.containsMatchingElement(
      <SetUpMessage
        type="courses"
        headingText="Start learning"
        descriptionText="Browse Code.org's courses to find your next challenge."
        buttonText="Find a course"
        buttonUrl="/courses"
      />
    ));
  });
});
