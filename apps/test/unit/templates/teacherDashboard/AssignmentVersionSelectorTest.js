import {render, screen} from '@testing-library/react';
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
    render(<AssignmentVersionSelector {...defaultProps} />);

    // Renders all options
    expect(screen.getByRole('option', {name: '2017'})).toBeInTheDocument();
    expect(
      screen.getByRole('option', {name: '2018 (Recommended)'})
    ).toBeInTheDocument();
  });
});
