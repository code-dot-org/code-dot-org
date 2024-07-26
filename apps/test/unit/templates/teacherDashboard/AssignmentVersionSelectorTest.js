import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AssignmentVersionSelector from '@cdo/apps/templates/teacherDashboard/AssignmentVersionSelector';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

const defaultProps = {
  onChangeVersion: () => {},
  selectedCourseVersionId: 1,
  courseVersions: courseOfferings['1'].course_versions,
  disabled: false,
};

describe('AssignmentVersionSelector', () => {
  it('an option and AssignmentVersionMenuItem for each course version', () => {
    const wrapper = shallow(<AssignmentVersionSelector {...defaultProps} />);
    expect(wrapper.find('option').length).toEqual(2);
    expect(wrapper.find('AssignmentVersionMenuItem').length).toEqual(2);
    expect(wrapper.find('option').map(option => option.text())).toEqual([
      '2018 (Recommended)',
      '2017',
    ]);
  });
});
