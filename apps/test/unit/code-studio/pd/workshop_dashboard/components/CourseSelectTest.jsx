import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CourseSelect, {
  getAllowedCourses,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/CourseSelect';
import Permission, {
  Organizer,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import '../workshopFactory';
import {
  Courses,
  ActiveCourses,
} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {expect} from '../../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('CourseSelect', () => {
  it('only renders blank if course is empty', () => {
    const wrapper = shallow(
      <CourseSelect
        course={null}
        facilitatorCourses={[]}
        permission={new Permission([Organizer])}
        readOnly={false}
        onChange={() => {}}
        validation={{help: {}, isValid: true, style: {}}}
      />
    );

    expect(wrapper.containsMatchingElement(<option />)).to.be.true;
  });

  describe('getAllowedCourses', () => {
    it('getAllowedCourses returns only active courses if no course provided', () => {
      expect(
        getAllowedCourses(new Permission([Organizer]), [], null),
        ActiveCourses
      );
    });

    it('getAllowedCourses returns only active courses if course provided is active course', () => {
      expect(
        getAllowedCourses(new Permission([Organizer]), [], 'CS Discoveries'),
        ActiveCourses
      );
    });

    it('getAllowedCourses returns all courses if course is archived', () => {
      expect(
        getAllowedCourses(new Permission([Organizer]), [], 'Admin'),
        Courses
      );
    });
  });
});
