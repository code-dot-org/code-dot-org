import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';

import DCDO from '@cdo/apps/dcdo';
import StudentSnapshot from '@cdo/apps/templates/studentSnapshot/StudentSnapshot';

import {createStore} from '../../../util/redux';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {
    fetchJson: jest.fn(() =>
      Promise.resolve({
        value: {lessons: [], hasUnnumberedLessons: false},
        response: new Response(),
      })
    ),
  },
}));

jest.mock('@cdo/apps/templates/sectionProgress/sectionProgressLoader', () => ({
  loadUnitProgress: jest.fn(),
}));

jest.mock('@cdo/apps/redux/unitSelectionRedux', () => ({
  ...jest.requireActual('@cdo/apps/redux/unitSelectionRedux'),
  asyncLoadCoursesWithProgress: jest.fn(() => () => Promise.resolve()),
}));

const makeStore = () =>
  createStore(() => ({
    teacherSections: {
      selectedSectionId: 1,
      selectedStudents: [{id: 1, name: 'Student1', familyName: 'Test'}],
      sectionIds: [1],
      sections: {
        1: {
          id: 1,
          name: 'Test Section',
          courseId: 10,
          unitPosition: 1,
          courseVersionId: 10,
        },
      },
      isLoadingSectionData: false,
    },
    unitSelection: {
      scriptId: 100,
      coursesWithProgress: [],
      isLoadingCoursesWithProgress: false,
      courseVersionId: null,
    },
    currentUser: {
      aiDifferentiationEnabled: false,
    },
  }));

describe('StudentSnapshot', () => {
  beforeEach(() => {
    DCDO.reset();
    jest.clearAllMocks();
  });

  it('renders without errors', async () => {
    await act(async () => {
      render(
        <Provider store={makeStore()}>
          <StudentSnapshot />
        </Provider>
      );
    });

    screen.getByText('Next student >');
    screen.getByRole('heading', {level: 4, name: 'Student1 Test'});
    screen.getByText('Lesson Insight');
  });

  it('displays the feedback alert when DCDO flag is set to a valid URL', async () => {
    DCDO.set(
      'student-snapshot-feedback-link',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'https://example.com/feedback' as any
    );

    await act(async () => {
      render(
        <Provider store={makeStore()}>
          <StudentSnapshot />
        </Provider>
      );
    });

    screen.getByText(
      "We'd love your feedback on the new Student Snapshot page. Just a few minutes will help us improve!"
    );
    screen.getByText('Feedback form');
  });

  it('does not display the feedback alert when DCDO flag is not set', async () => {
    await act(async () => {
      render(
        <Provider store={makeStore()}>
          <StudentSnapshot />
        </Provider>
      );
    });

    expect(
      screen.queryByText(
        "We'd love your feedback on the new Student Snapshot page. Just a few minutes will help us improve!"
      )
    ).not.toBeInTheDocument();
  });
});
