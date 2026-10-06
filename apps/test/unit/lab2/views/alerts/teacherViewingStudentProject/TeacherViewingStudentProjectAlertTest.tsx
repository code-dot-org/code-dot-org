import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getCurrentLevel: jest.fn(),
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockedUseAppSelector = useAppSelector as jest.Mock;
const mockedGetCurrentLevel = getCurrentLevel as jest.Mock;

describe('TeacherViewingStudentProjectAlert', () => {
  beforeEach(() => {
    const state = {
      progress: {viewAsUserId: 99, unitProgress: {}},
      teacherSections: {selectedStudents: [{id: 99, name: 'Aisha Khan'}]},
    };
    mockedUseAppSelector.mockImplementation(selector => selector(state));
    // Level progress says not started; attemptStatus must win over it.
    mockedGetCurrentLevel.mockReturnValue({status: LevelStatus.not_tried});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('says the student has not started, as info', () => {
    render(<TeacherViewingStudentProjectAlert attemptStatus="notStarted" />);

    const alert = screen.getByText(/hasn't started this level/);
    expect(alert).toHaveTextContent("Aisha Khan hasn't started this level.");
  });

  it('says the student is still working, as a warning', () => {
    render(<TeacherViewingStudentProjectAlert attemptStatus="inProgress" />);

    expect(
      screen.getByText(/is still working on this assessment/)
    ).toHaveTextContent('Aisha Khan is still working on this assessment.');
  });

  it('says the teacher is viewing submitted work in read only mode', () => {
    render(<TeacherViewingStudentProjectAlert attemptStatus="submitted" />);

    expect(screen.getByText(/work in read only mode/)).toHaveTextContent(
      "You are viewing Aisha Khan's work in read only mode."
    );
  });

  it('keeps the level-progress wording for labs that pass no attemptStatus', () => {
    render(<TeacherViewingStudentProjectAlert />);

    expect(screen.queryByText(/this level/)).not.toBeInTheDocument();
    expect(screen.queryByText(/assessment/)).not.toBeInTheDocument();
  });
});
