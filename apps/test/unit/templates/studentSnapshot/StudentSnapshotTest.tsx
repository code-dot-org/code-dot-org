import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';
import {MemoryRouter, useLocation} from 'react-router-dom';

import DCDO from '@cdo/apps/dcdo';
import StudentSnapshot from '@cdo/apps/templates/studentSnapshot/StudentSnapshot';
import HttpClient from '@cdo/apps/util/HttpClient';

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

jest.mock(
  '@cdo/apps/templates/sectionProgressV2/sectionProgressLoader',
  () => ({
    loadUnitProgress: jest.fn(),
  })
);

jest.mock('@cdo/apps/redux/unitSelectionRedux', () => ({
  ...jest.requireActual('@cdo/apps/redux/unitSelectionRedux'),
  asyncLoadCoursesWithProgress: jest.fn(() => () => Promise.resolve()),
}));

const makeStore = (scriptId = 100) =>
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
      scriptId,
      coursesWithProgress: [],
      isLoadingCoursesWithProgress: false,
      courseVersionId: null,
    },
    currentUser: {
      aiDifferentiationEnabled: false,
    },
    sectionProgress: {
      unitDataByUnit: {},
      studentLessonProgressByUnit: {},
      studentLevelProgressByUnit: {},
      isLoadingProgress: false,
    },
  }));

const LocationSearch = () => <>{useLocation().search}</>;

const renderSnapshot = (initialRoute = '/', scriptId?: number) =>
  render(
    <Provider store={makeStore(scriptId)}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <StudentSnapshot />
        <LocationSearch />
      </MemoryRouter>
    </Provider>
  );

describe('StudentSnapshot', () => {
  beforeEach(() => {
    DCDO.reset();
    jest.clearAllMocks();
  });

  it('renders without errors', async () => {
    await act(async () => {
      renderSnapshot();
    });

    screen.getAllByText('Next');
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
      renderSnapshot();
    });

    screen.getByText(
      "We'd love your feedback on the new Student Snapshot page. Just a few minutes will help us improve!"
    );
    screen.getByText('Feedback form');
  });

  it('does not display the feedback alert when DCDO flag is not set', async () => {
    await act(async () => {
      renderSnapshot();
    });

    expect(
      screen.queryByText(
        "We'd love your feedback on the new Student Snapshot page. Just a few minutes will help us improve!"
      )
    ).not.toBeInTheDocument();
  });

  it('initializes from the studentId search param instead of the default student', async () => {
    await act(async () => {
      renderSnapshot('/?studentId=1');
    });

    screen.getByRole('heading', {level: 4, name: 'Student1 Test'});
  });

  it('falls back to the default student when studentId in the URL is not a number', async () => {
    await act(async () => {
      renderSnapshot('/?studentId=not-a-number');
    });

    screen.getByRole('heading', {level: 4, name: 'Student1 Test'});
  });

  it('writes the selected student id back into the URL', async () => {
    await act(async () => {
      renderSnapshot();
    });

    screen.getByText('?studentId=1');
  });

  describe('skill map widget', () => {
    // The lessons loader is memoized by unit, so each case uses its own unit.
    const renderWithLesson = async (
      scriptId: number,
      hasAdaptiveLevel: boolean
    ) => {
      (HttpClient.fetchJson as jest.Mock).mockImplementation((url: string) =>
        Promise.resolve({
          value: url.startsWith('/student_snapshots/lessons/')
            ? {
                lessons: [
                  {
                    id: 5,
                    name: 'Lesson 5',
                    hasLessonPlan: false,
                    isLockable: false,
                    position: 1,
                    hasAdaptiveLevel,
                  },
                ],
                hasUnnumberedLessons: false,
              }
            : {},
          response: new Response(),
        })
      );
      await act(async () => {
        renderSnapshot('/?lessonId=5&studentId=1', scriptId);
      });
    };

    it('appears for an adaptive lesson', async () => {
      await renderWithLesson(201, true);

      screen.getByText('Skill Map');
    });

    it('does not appear for any other lesson', async () => {
      await renderWithLesson(202, false);

      expect(screen.queryByText('Skill Map')).not.toBeInTheDocument();
    });
  });
});
