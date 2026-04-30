import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import LessonDeepDiveContainer from '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveContainer';
import {
  LessonDeepDiveData,
  ReflectionData,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';

// Mock the experiment gate so the container renders.
jest.mock('@cdo/apps/util/experiments', () => ({
  isEnabledAllowingQueryString: () => true,
  LESSON_TUTOR: 'lesson-tutor',
}));

// Capture the onSubmitComplete prop from ReflectionBox so tests can fire it.
let capturedOnSubmitComplete: ((data: ReflectionData) => void) | null = null;

jest.mock('@cdo/apps/aiTutor/views/lessonDeepDive/ReflectionBox', () => ({
  __esModule: true,
  default: ({
    onSubmitComplete,
  }: {
    onSubmitComplete: (data: ReflectionData) => void;
  }) => {
    capturedOnSubmitComplete = onSubmitComplete;
    return <div />;
  },
}));

// Stub out all other boxes to avoid rendering their dependencies.
jest.mock('@cdo/apps/aiTutor/views/lessonDeepDive/WelcomeBox', () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock('@cdo/apps/aiTutor/views/lessonDeepDive/LevelsAttemptedBox', () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock('@cdo/apps/aiTutor/views/lessonDeepDive/TimeSpentBox', () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock('@cdo/apps/aiTutor/views/lessonDeepDive/ValidatedLevelsBox', () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock('@cdo/apps/aiTutor/views/lessonDeepDive/InterventionBox', () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock('@cdo/apps/aiTutor/views/lessonDeepDive/PracticeBox', () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock('@cdo/apps/aiTutor/views/lessonDeepDive/TutorSummaryBox', () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock('@cdo/apps/aiTutor/views/lessonDeepDive/FizzyButton', () => ({
  __esModule: true,
  default: ({
    onClick,
    ariaLabel,
    children,
  }: {
    onClick: () => void;
    ariaLabel: string;
    children: React.ReactNode;
  }) => (
    <button type="button" onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

const LESSON_DATA: LessonDeepDiveData = {
  lessonId: 42,
  lessonName: 'Test Lesson',
  lessonSummary: 'Summary',
  vocabulary: [],
  objectives: [],
  assessmentAnalysis: [],
  jsonVideos: [],
  practiceProblems: [],
  progressCounts: {
    levelsTotalCount: 0,
    levelsAttemptedCount: 0,
    validatedLevelsTotalCount: 0,
    validatedLevelsCorrectCount: 0,
    validatedLevelsIncorrectCount: 0,
  },
  timeSpentSeconds: 0,
};

const REFLECTION_DATA: ReflectionData = {
  objectiveReflections: {},
  success: 'Good',
  struggle: 'Hard',
};

function clickNext(times = 1) {
  for (let i = 0; i < times; i++) {
    fireEvent.click(screen.getByRole('button', {name: /next/i}));
  }
}

describe('LessonDeepDiveContainer welcome fetch', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    capturedOnSubmitComplete = null;
    mockFetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({welcomeMessage: 'Welcome!'}),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders next step navigation landmark', () => {
    render(<LessonDeepDiveContainer lessonDeepDiveData={LESSON_DATA} />);
    expect(
      screen.getByRole('navigation', {name: /next step/i})
    ).toBeInTheDocument();
  });

  it('does not fetch before the intervention box is reached', () => {
    render(<LessonDeepDiveContainer lessonDeepDiveData={LESSON_DATA} />);
    // Navigate to reflection box (index 4) — one before intervention.
    clickNext(4);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches when intervention box is reached after reflection is submitted', async () => {
    render(<LessonDeepDiveContainer lessonDeepDiveData={LESSON_DATA} />);
    // Navigate to reflection box (index 4).
    clickNext(4);
    expect(capturedOnSubmitComplete).not.toBeNull();
    // Submit reflection to set reflectionData, then advance to intervention.
    act(() => capturedOnSubmitComplete!(REFLECTION_DATA));
    clickNext(1);
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/lessons/42/tutor_welcome_message'
      )
    );
  });

  it('does not fetch a second time when navigating back and forward to intervention', async () => {
    render(<LessonDeepDiveContainer lessonDeepDiveData={LESSON_DATA} />);
    clickNext(4);
    act(() => capturedOnSubmitComplete!(REFLECTION_DATA));
    clickNext(1);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    // Go back then forward again.
    fireEvent.click(screen.getByRole('button', {name: /previous/i}));
    clickNext(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
