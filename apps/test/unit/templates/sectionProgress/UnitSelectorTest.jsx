import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {UnconnectedUnitSelector} from '@cdo/apps/templates/sectionProgress/UnitSelector';
import {fakeCoursesWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

const DEFAULT_PROPS = {
  coursesWithProgress: fakeCoursesWithProgress,
  scriptId: null,
  onChange: () => {},
  asyncLoadCoursesWithProgress: () => {},
  isLoadingCourses: false,
};

describe('UnitSelector', () => {
  it('loads the correct number of course versions', () => {
    render(<UnconnectedUnitSelector {...DEFAULT_PROPS} />);
    const dropdown = screen.getByRole('combobox');
    fireEvent.click(dropdown);

    screen.getByRole('group', {name: 'Course A'});
    screen.getByRole('group', {name: 'CS Discoveries 2018'});
    screen.getByRole('group', {name: 'Flappy'});

    screen.getByRole('option', {name: 'Course A (2018)'});
    screen.getByRole('option', {name: 'Course A (2017)'});
    screen.getByRole('option', {name: 'Unit 1'});
    screen.getByRole('option', {name: 'Unit 2'});
    screen.getByRole('option', {name: 'Flappy'});
  });

  it('loads courses on initial render', () => {
    const asyncLoadCoursesWithProgress = jest.fn();
    render(
      <UnconnectedUnitSelector
        {...DEFAULT_PROPS}
        coursesWithProgress={[]}
        asyncLoadCoursesWithProgress={asyncLoadCoursesWithProgress}
      />
    );

    expect(asyncLoadCoursesWithProgress).toHaveBeenCalledTimes(1);
  });

  it('shows skeleton if loading', () => {
    render(
      <UnconnectedUnitSelector {...DEFAULT_PROPS} isLoadingCourses={true} />
    );
    expect(screen.queryByRole('combobox')).toBeNull();
  });
});
