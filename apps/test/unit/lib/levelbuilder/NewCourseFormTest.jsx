import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import NewCourseForm from '@cdo/apps/lib/levelbuilder/NewCourseForm';

describe('NewCourseFormTest', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      families: ['family-1', 'family-2'],
      versionYearOptions: ['1991', '1992']
    };
  });

  it('updates markdown', () => {
    const wrapper = shallow(<NewCourseForm {...defaultProps} />);
    expect(wrapper.find('NewCourseFields').length).to.equal(1);
  });
});
