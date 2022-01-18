import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import CourseOfferingEditor from '@cdo/apps/lib/levelbuilder/CourseOfferingEditor';

describe('CourseOfferingEditor', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      courseOfferingKey: '',
      initialIsFeatured: false,
      initialCategory: '',
      initialDisplayName: ''
    };
  });

  it('test', () => {
    const wrapper = shallow(<CourseOfferingEditor {...defaultProps} />);

    expect(wrapper.find('SaveBar').length).to.equal(1);
  });
});
