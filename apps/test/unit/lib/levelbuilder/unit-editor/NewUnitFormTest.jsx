import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import NewUnitForm from '@cdo/apps/lib/levelbuilder/unit-editor/NewUnitForm';

describe('NewUnitFormTest', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      families: ['family-1', 'family-2'],
      versionYearOptions: ['1991', '1992']
    };
  });

  it('updates markdown', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);

    expect(wrapper.find('NewCourseFields').length).to.equal(1);
  });
});
