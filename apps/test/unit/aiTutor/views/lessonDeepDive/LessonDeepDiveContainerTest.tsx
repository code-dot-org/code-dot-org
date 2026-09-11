import {render, screen, act, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import LessonDeepDiveContainer from '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveContainer';
import {LessonDeepDiveData} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@code-dot-org/lesson-deep-dive', () => ({
  ...jest.requireActual('@code-dot-org/lesson-deep-dive'),
  WelcomeBox: () => <div>welcome</div>,
  LevelsAttemptedBox: () => <div>levels-attempted</div>,
  TimeSpentBox: () => <div>time-spent</div>,
  ValidatedLevelsBox: () => <div>validated-levels</div>,
  LessonSummaryCard: () => <div>lesson-summary</div>,
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn().mockResolvedValue(undefined)},
}));

const LESSON_DATA: LessonDeepDiveData = {
  lessonId: 1,
  lessonName: 'Test Lesson',
  lessonSummary: '',
  vocabulary: [],
  objectives: [],
  assessmentAnalysis: [],
  jsonVideos: [],
  practiceProblems: [],
  progressCounts: {
    levelsTotalCount: 10,
    levelsAttemptedCount: 5,
    validatedLevelsTotalCount: 5,
    validatedLevelsCorrectCount: 3,
    validatedLevelsIncorrectCount: 2,
  },
  timeSpentSeconds: 600,
  unitLabel: null,
  nextLessonUrl: null,
};

function renderContainer() {
  render(<LessonDeepDiveContainer lessonDeepDiveData={LESSON_DATA} />);
}

describe('LessonDeepDiveContainer story card sequence', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    experiments.setEnabled(experiments.LESSON_TUTOR, true);
    (HttpClient.post as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    experiments.setEnabled(experiments.LESSON_TUTOR, false);
  });

  it('starts on the welcome card', () => {
    renderContainer();
    expect(screen.getByText('welcome')).toBeInTheDocument();
  });

  it('auto-advances to the next card when the timer fires', () => {
    renderContainer();
    act(() => jest.runOnlyPendingTimers());
    expect(screen.getByText('levels-attempted')).toBeInTheDocument();
  });

  it('auto-advances through each story card in order', () => {
    renderContainer();
    const order = [
      'levels-attempted',
      'time-spent',
      'validated-levels',
      'lesson-summary',
    ];
    for (const card of order) {
      act(() => jest.runOnlyPendingTimers());
      expect(screen.getByText(card)).toBeInTheDocument();
    }
  });

  it('does not auto-advance past lesson-summary', () => {
    renderContainer();
    // advance through welcome → levels-attempted → time-spent → validated-levels → lesson-summary
    for (let i = 0; i < 4; i++) {
      act(() => jest.runOnlyPendingTimers());
    }
    expect(screen.getByText('lesson-summary')).toBeInTheDocument();
    // no pending timer should fire from lesson-summary
    act(() => jest.runOnlyPendingTimers());
    expect(screen.getByText('lesson-summary')).toBeInTheDocument();
  });

  it('advances with ArrowRight', () => {
    renderContainer();
    act(() => fireEvent.keyDown(window, {key: 'ArrowRight'}));
    expect(screen.getByText('levels-attempted')).toBeInTheDocument();
  });

  it('goes back with ArrowLeft', () => {
    renderContainer();
    act(() => fireEvent.keyDown(window, {key: 'ArrowRight'}));
    act(() => fireEvent.keyDown(window, {key: 'ArrowLeft'}));
    expect(screen.getByText('welcome')).toBeInTheDocument();
  });

  it('manual navigation resets the auto-advance timer', () => {
    renderContainer();
    // manually skip to levels-attempted
    act(() => fireEvent.keyDown(window, {key: 'ArrowRight'}));
    expect(screen.getByText('levels-attempted')).toBeInTheDocument();
    // timer fires from levels-attempted, not welcome
    act(() => jest.runOnlyPendingTimers());
    expect(screen.getByText('time-spent')).toBeInTheDocument();
  });
});
