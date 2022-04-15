import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../util/reconfiguredChai';
import UnitSelector from '@cdo/apps/templates/sectionProgress/UnitSelector';
import {fakeCourseVersionsWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

let defaultProps = {
  courseVersionsWithProgress: fakeCourseVersionsWithProgress,
  scriptId: null,
  onChange: () => {}
};

describe('UnitSelector', () => {
  it('loads the correct number of course versions', () => {
    const wrapper = shallow(<UnitSelector {...defaultProps} />);
    expect(wrapper.find('optgroup').length).to.equal(4);
    assert.deepEqual(wrapper.find('optgroup').map(o => o.props().label), [
      'Course A (2017)',
      'Course A (2018)',
      'CS Discoveries 2018',
      'Flappy'
    ]);
    expect(wrapper.find('option').length).to.equal(5);
  });
});
