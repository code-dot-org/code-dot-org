import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AssignmentVersionSelector from '@cdo/apps/templates/teacherDashboard/AssignmentVersionSelector';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

import {assert} from '../../../util/reconfiguredChai';

const defaultProps = {
  onChangeVersion: () => {},
  selectedCourseVersionId: 1,
  courseVersions: courseOfferings['1'].course_versions,
  disabled: false,
};

describe('AssignmentVersionSelector', () => {
  it('an option and AssignmentVersionMenuItem for each course version', () => {
    const wrapper = shallow(<AssignmentVersionSelector {...defaultProps} />);
    assert.equal(wrapper.find('option').length, 2);
    assert.equal(wrapper.find('AssignmentVersionMenuItem').length, 2);
    assert.deepEqual(
      wrapper.find('option').map(option => option.text()),
      ['2018 (Recommended)', '2017']
    );
  });
});
