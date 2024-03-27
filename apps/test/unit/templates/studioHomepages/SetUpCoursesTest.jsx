import {shallow} from 'enzyme';
import React from 'react';

import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';
import SetUpCourses from '@cdo/apps/templates/studioHomepages/SetUpCourses';

import {assert} from '../../../util/reconfiguredChai';

describe('SetUpCourses', () => {
  it('renders as expected for a teacher', () => {
    const wrapper = shallow(<SetUpCourses isTeacher={true} />);
    assert(
      wrapper.containsMatchingElement(
        <BorderedCallToAction
          type="courses"
          headingText="Start learning"
          descriptionText="Assign a course to your classroom or start your own course."
          buttonText="Find a course"
          buttonUrl="/catalog"
        />
      )
    );
  });

  it('renders as expected for a student', () => {
    const wrapper = shallow(<SetUpCourses isTeacher={false} />);
    assert(
      wrapper.containsMatchingElement(
        <BorderedCallToAction
          type="courses"
          headingText="Start learning"
          descriptionText="Browse Code.org's courses to find your next challenge."
          buttonText="Find a course"
          buttonUrl="/courses"
        />
      )
    );
  });
});
