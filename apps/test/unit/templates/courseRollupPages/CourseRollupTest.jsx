import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CourseRollup from '@cdo/apps/templates/courseRollupPages/CourseRollup';

import {courseData} from './rollupTestData';

describe('CourseRollup', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      objectToRollUp: 'Vocabulary',
      course: courseData,
    };
  });

  it('renders course link', () => {
    const wrapper = mount(<CourseRollup {...defaultProps} />);

    const navLink = wrapper.find('a').at(0);
    expect(navLink.props().href).toContain('/courses/my-course');
    expect(navLink.contains('< My Course')).toBe(true);
  });

  it('renders correct number of units', () => {
    const wrapper = mount(<CourseRollup {...defaultProps} />);

    expect(wrapper.find('RollupUnitEntry').length).toBe(2);
  });
});
