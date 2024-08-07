import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import UnitSelector from '@cdo/apps/templates/sectionProgress/UnitSelector';
import {fakeCoursesWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

let defaultProps = {
  coursesWithProgress: fakeCoursesWithProgress,
  scriptId: null,
  onChange: () => {},
};

describe('UnitSelector', () => {
  it('loads the correct number of course versions', () => {
    const wrapper = shallow(<UnitSelector {...defaultProps} />);
    expect(wrapper.find('optgroup').length).toBe(3);
    expect(wrapper.find('optgroup').map(o => o.props().label)).toEqual([
      'Course A',
      'CS Discoveries 2018',
      'Flappy',
    ]);
    expect(wrapper.find('option').length).toBe(5);
  });
});
