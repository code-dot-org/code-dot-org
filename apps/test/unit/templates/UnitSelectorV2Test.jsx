import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {fakeCoursesWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';
import {UnconnectedUnitSelectorV2} from '@cdo/apps/templates/UnitSelectorV2';

jest.mock('@cdo/apps/templates/sectionProgress/sectionProgressLoader');

const DEFAULT_PROPS = {
  coursesWithProgress: fakeCoursesWithProgress,
  scriptId: 2, // Course A (2018)
  sectionId: 1,
  setScriptId: () => {},
  onChange: () => {},
  asyncLoadCoursesWithProgress: () => {},
  isLoadingCourses: false,
  isLoadingSectionData: false,
};

describe('UnitSelector', () => {
  it('loads the correct number of course versions', () => {
    render(<UnconnectedUnitSelectorV2 {...DEFAULT_PROPS} />);
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

  it('sets scriptId on change', () => {
    const setScriptId = jest.fn();
    render(
      <UnconnectedUnitSelectorV2 {...DEFAULT_PROPS} setScriptId={setScriptId} />
    );
    const dropdown = screen.getByRole('combobox');
    fireEvent.click(dropdown);

    const option = screen.getByRole('option', {name: 'Flappy'});
    fireEvent.change(dropdown, {target: {value: option.value}});

    expect(setScriptId).toHaveBeenCalledTimes(1);
  });

  it('loads courses on initial render', () => {
    const asyncLoadCoursesWithProgress = jest.fn();
    render(
      <UnconnectedUnitSelectorV2
        {...DEFAULT_PROPS}
        coursesWithProgress={[]}
        asyncLoadCoursesWithProgress={asyncLoadCoursesWithProgress}
      />
    );

    expect(asyncLoadCoursesWithProgress).toHaveBeenCalledTimes(1);
  });

  it('loads courses on section change', () => {
    const asyncLoadCoursesWithProgress = jest.fn();
    let sectionId = 1;
    render(
      <UnconnectedUnitSelectorV2
        {...DEFAULT_PROPS}
        coursesWithProgress={[]}
        sectionId={sectionId}
        asyncLoadCoursesWithProgress={asyncLoadCoursesWithProgress}
      />
    );

    sectionId = 2;

    waitFor(() => {
      expect(asyncLoadCoursesWithProgress).toHaveBeenCalledTimes(2);
    });
  });

  it('shows skeleton if loading', () => {
    render(
      <UnconnectedUnitSelectorV2 {...DEFAULT_PROPS} isLoadingCourses={true} />
    );
    expect(screen.queryByRole('select')).toBeNull();
  });

  it('shows skeleton if loading courses', () => {
    render(
      <UnconnectedUnitSelectorV2 {...DEFAULT_PROPS} isLoadingCourses={true} />
    );
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('shows skeleton if loading section', () => {
    render(
      <UnconnectedUnitSelectorV2
        {...DEFAULT_PROPS}
        isLoadingSectionData={true}
      />
    );
    expect(screen.queryByRole('combobox')).toBeNull();
  });
});
