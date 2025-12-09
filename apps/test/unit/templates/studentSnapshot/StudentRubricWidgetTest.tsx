import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import StudentRubricWidget from '@cdo/apps/templates/studentSnapshot/studentRubricWidget/StudentRubricWidget';
import type {Rubric, StudentLevelInfo} from '@cdo/apps/types/rubricTypes';
import HttpClient from '@cdo/apps/util/HttpClient';

// Mock HttpClient - must be before imports that use it
jest.mock('@cdo/apps/util/HttpClient', () => {
  return {
    __esModule: true,
    default: {
      fetchJson: jest.fn(),
    },
  };
});

// Mock LearningGoals component
jest.mock('@cdo/apps/templates/rubrics/LearningGoals', () => {
  return function MockLearningGoals() {
    // eslint-disable-next-line react/forbid-dom-props
    return <div data-testid="learning-goals">LearningGoals Component</div>;
  };
});

// Mock Redux store
const mockStore = createStore(() => ({
  teacherSections: {
    selectedSectionId: 1,
    selectedStudents: [{id: 1, name: 'Student1', familyName: ''}],
    sectionIds: [1],
    sections: {
      1: {id: 1, name: 'Test Section', hidden: false},
    },
  },
  teacherPanel: {
    levelsWithProgress: [],
  },
  teacherRubric: {
    hasTeacherFeedbackMap: {},
    aiEvalStatusMap: {},
  },
}));

const mockRubric: Rubric = {
  id: 1,
  lesson: {
    position: 11,
    name: 'Lesson 11',
  },
  level: {id: 10000},
  learningGoals: [
    {
      learningGoal: 'Test Learning Goal',
      evidenceLevels: [
        {
          understanding: 3,
          teacherDescription: 'Excellent work',
        },
      ],
    },
  ],
};

const mockStudentLevelInfo: StudentLevelInfo = {
  name: 'Test Student',
  user_id: 1,
  timeSpent: 100,
  attempts: 2,
  lastAttempt: new Date().toISOString(),
};

describe('StudentRubricWidget', () => {
  let mockFetchJson: jest.Mock;

  beforeEach(() => {
    // Get the mock function - must be done in beforeEach to get fresh mock
    mockFetchJson = HttpClient.fetchJson as jest.Mock;
    jest.clearAllMocks();
    mockFetchJson.mockReset();
  });

  it('renders loading state initially', () => {
    mockFetchJson.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={1}
          studentId={1}
          studentName="Test Student"
        />
      </Provider>
    );

    // WidgetTemplate renders a Spinner with id="uitest-spinner" when loading
    expect(document.getElementById('uitest-spinner')).toBeInTheDocument();
  });

  it('renders loading state when lesson ID is not provided', () => {
    // Using 0 to test the !lessonId check (0 is falsy in JavaScript)
    // Component shows loading state when lessonId is falsy
    render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={0}
          studentId={1}
          studentName="Test Student"
        />
      </Provider>
    );

    // WidgetTemplate renders a Spinner with id="uitest-spinner" when loading
    expect(document.getElementById('uitest-spinner')).toBeInTheDocument();
    // Ensure no API call is made when lessonId is falsy
    expect(mockFetchJson).not.toHaveBeenCalled();
  });

  it('renders error state when API call fails', async () => {
    mockFetchJson.mockRejectedValue(new Error('Network error'));

    render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={1}
          studentId={1}
          studentName="Test Student"
        />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No rubric found')).toBeInTheDocument();
    });
  });

  it('renders error state when no rubric data is found', async () => {
    mockFetchJson.mockResolvedValue({
      value: {} as {rubricId: number; rubric: Rubric; levelId: number},
      response: new Response(),
    });

    render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={1}
          studentId={1}
          studentName="Test Student"
        />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No rubric data found')).toBeInTheDocument();
    });
  });

  it('renders "No rubric data available" when rubric has no learning goals', async () => {
    mockFetchJson.mockResolvedValue({
      value: {
        rubricId: 1,
        rubric: {
          ...mockRubric,
          learningGoals: [],
        },
        levelId: 10000,
      },
      response: new Response(),
    });

    render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={1}
          studentId={1}
          studentName="Test Student"
        />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No rubric data available.')).toBeInTheDocument();
    });
  });

  it('renders LearningGoals component when rubric data is loaded successfully', async () => {
    mockFetchJson.mockResolvedValue({
      value: {
        rubricId: 1,
        rubric: mockRubric,
        levelId: 10000,
      },
      response: new Response(),
    });

    render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={1}
          studentId={1}
          studentName="Test Student"
        />
      </Provider>
    );

    await waitFor(() => {
      // eslint-disable-next-line no-restricted-properties
      expect(screen.getByTestId('learning-goals')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading rubric...')).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('uses provided studentLevelInfo when available', async () => {
    mockFetchJson.mockResolvedValue({
      value: {
        rubricId: 1,
        rubric: mockRubric,
        levelId: 10000,
      },
      response: new Response(),
    });

    render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={1}
          studentId={1}
          studentName="Test Student"
          studentLevelInfo={mockStudentLevelInfo}
        />
      </Provider>
    );

    await waitFor(() => {
      // eslint-disable-next-line no-restricted-properties
      expect(screen.getByTestId('learning-goals')).toBeInTheDocument();
    });
  });

  it('uses default studentName when not provided', async () => {
    mockFetchJson.mockResolvedValue({
      value: {
        rubricId: 1,
        rubric: mockRubric,
        levelId: 10000,
      },
      response: new Response(),
    });

    render(
      <Provider store={mockStore}>
        <StudentRubricWidget lessonId={1} studentId={123} />
      </Provider>
    );

    await waitFor(() => {
      // eslint-disable-next-line no-restricted-properties
      expect(screen.getByTestId('learning-goals')).toBeInTheDocument();
    });
  });

  it('passes correct props to LearningGoals component', async () => {
    mockFetchJson.mockResolvedValue({
      value: {
        rubricId: 1,
        rubric: mockRubric,
        levelId: 10000,
      },
      response: new Response(),
    });

    render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={1}
          studentId={1}
          studentName="Test Student"
          studentLevelInfo={mockStudentLevelInfo}
          teacherHasEnabledAi={true}
          canProvideFeedback={false}
        />
      </Provider>
    );

    await waitFor(() => {
      // eslint-disable-next-line no-restricted-properties
      expect(screen.getByTestId('learning-goals')).toBeInTheDocument();
    });
  });

  it('refetches data when lessonId changes', async () => {
    mockFetchJson.mockResolvedValue({
      value: {
        rubricId: 1,
        rubric: mockRubric,
        levelId: 10000,
      },
      response: new Response(),
    });

    const {rerender} = render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={1}
          studentId={1}
          studentName="Test Student"
        />
      </Provider>
    );

    await waitFor(() => {
      // eslint-disable-next-line no-restricted-properties
      expect(screen.getByTestId('learning-goals')).toBeInTheDocument();
    });

    expect(mockFetchJson).toHaveBeenCalledTimes(1);
    expect(mockFetchJson).toHaveBeenCalledWith('/rubrics/find?lesson_id=1');

    // Change lessonId
    rerender(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={2}
          studentId={1}
          studentName="Test Student"
        />
      </Provider>
    );

    await waitFor(() => {
      expect(mockFetchJson).toHaveBeenCalledTimes(2);
      expect(mockFetchJson).toHaveBeenCalledWith('/rubrics/find?lesson_id=2');
    });
  });

  it('includes levelId in request when provided', async () => {
    mockFetchJson.mockResolvedValue({
      value: {
        rubricId: 1,
        rubric: mockRubric,
        levelId: 123,
      },
      response: new Response(),
    });

    render(
      <Provider store={mockStore}>
        <StudentRubricWidget
          lessonId={1}
          studentId={1}
          studentName="Test Student"
          levelId={123}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(mockFetchJson).toHaveBeenCalledWith(
        '/rubrics/find?lesson_id=1&level_id=123'
      );
    });
  });
});
