import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import CourseOrUnitRollup from '@cdo/apps/templates/courseRollupPages/CourseOrUnitRollup';
import {courseData} from './rollupTestData';

describe('CourseOrUnitRollup', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      objectToRollUp: 'Vocabulary',
      course: courseData
    };
  });

  it('renders course link', () => {
    const wrapper = mount(<CourseOrUnitRollup {...defaultProps} />);

    const navLink = wrapper.find('a').at(0);
    expect(navLink.props().href).to.contain('/courses/my-course');
    expect(navLink.contains('< My Course')).to.be.true;
  });

  it('renders correct number of units', () => {
    const wrapper = mount(<CourseOrUnitRollup {...defaultProps} />);

    expect(wrapper.find('RollupUnitEntry').length).to.equal(2);
  });
});
