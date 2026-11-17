import {render, screen, act, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import LessonDeepDiveContainer from '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveContainer';
import {LessonDeepDiveData} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@code-dot-org/lesson-deep-dive', () => ({
  ...jest.requireActual('@code-dot-org/lesson-deep-dive'),
  WelcomeBox: ({onNext}: {onNext: () => void}) => (
    <div>
      welcome
      <button type="button" onClick={onNext}>
        skip
      </button>
    </div>
  ),
  LevelsAttemptedBox: () => <div>levels-attempted</div>,
  TimeSpentBox: () => <div>time-spent</div>,
  ValidatedLevelsBox: () => <div>validated-levels</div>,
  LessonSummaryCard: () => <div>lesson-summary</div>,
  PreSkillsCheck: ({
    onKeepPracticing,
    onTestSkills,
  }: {
    onKeepPracticing: () => void;
    onTestSkills: () => void;
  }) => (
    <div>
      pre-skills-check
      <button type="button" onClick={onKeepPracticing}>
        keep practicing
      </button>
      <button type="button" onClick={onTestSkills}>
        test skills
      </button>
    </div>
  ),
  TutorSummaryBox: () => <div>tutor-summary</div>,
  NextStepPicker: ({
    onPractice,
    onChallenge,
  }: {
    onPractice: () => void;
    onChallenge: () => void;
  }) => (
    <div>
      next-step
      <button type="button" onClick={onPractice}>
        practice
      </button>
      <button type="button" onClick={onChallenge}>
        challenge
      </button>
    </div>
  ),
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

const sendEventMock = analyticsReporter.sendEvent as jest.Mock;

jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/Reflection/ReflectionBox',
  () => ({__esModule: true, default: () => <div>reflection</div>})
);

jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ReviewModalities/InterventionBox',
  () => ({__esModule: true, default: () => <div>intervention</div>})
);

jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/SkillsCheck/SkillsCheck',
  () => ({__esModule: true, default: () => <div>skills-check</div>})
);

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn().mockResolvedValue(undefined)},
}));

let mockChallengesEnabled = true;
jest.mock('@cdo/apps/aiTutor/hooks/useLessonDeepDiveChallengesEnabled', () => ({
  useLessonDeepDiveChallengesEnabled: () => mockChallengesEnabled,
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

function renderContainer(initialScreen = 'welcome') {
  render(
    <MemoryRouter initialEntries={[`/${initialScreen}`]}>
      <Routes>
        <Route
          path=":screenId"
          element={<LessonDeepDiveContainer lessonDeepDiveData={LESSON_DATA} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('LessonDeepDiveContainer story card sequence', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    experiments.setEnabled(experiments.LESSON_TUTOR, true);
    mockChallengesEnabled = true;
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

  it('does not show a Continue button on the next-step screen', () => {
    renderContainer('next-step');
    expect(screen.queryByText('Continue')).not.toBeInTheDocument();
  });

  it('does not show a Continue button on the reflection screen', () => {
    renderContainer();
    // advance through the five story screens: welcome → levels-attempted →
    // time-spent → validated-levels → lesson-summary → reflection
    for (let i = 0; i < 5; i++) {
      act(() => fireEvent.keyDown(window, {key: 'ArrowRight'}));
    }
    expect(screen.queryByText('Continue')).not.toBeInTheDocument();
  });
});

describe('LessonDeepDiveContainer URL param routing', () => {
  beforeEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR, true);
    mockChallengesEnabled = true;
  });

  afterEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR, false);
  });

  it.each([
    ['reflection', 'reflection'],
    ['next-step', 'next-step'],
    ['intervention', 'intervention'],
    ['pre-skills-check', 'pre-skills-check'],
    ['skills-check', 'skills-check'],
    ['tutor-summary', 'tutor-summary'],
  ])('renders the %s screen when :screenId is "%s"', (screenId, label) => {
    renderContainer(screenId);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('falls back to welcome when :screenId is not a known screen', () => {
    renderContainer('not-a-real-screen');
    expect(screen.getByText('welcome')).toBeInTheDocument();
  });
});

describe('LessonDeepDiveContainer without challenges', () => {
  beforeEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR, true);
    mockChallengesEnabled = false;
  });

  afterEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR, false);
  });

  it('skips next-step going forward from reflection', () => {
    renderContainer('reflection');
    act(() => fireEvent.keyDown(window, {key: 'ArrowRight'}));
    expect(screen.getByText('intervention')).toBeInTheDocument();
  });

  it('skips next-step going back from intervention', () => {
    renderContainer('intervention');
    act(() => fireEvent.keyDown(window, {key: 'ArrowLeft'}));
    expect(screen.getByText('reflection')).toBeInTheDocument();
  });

  it('does not render next-step from the URL', () => {
    renderContainer('next-step');
    expect(screen.queryByText('next-step')).not.toBeInTheDocument();
  });
});

describe('LessonDeepDiveContainer Tutor+ analytics', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    experiments.setEnabled(experiments.LESSON_TUTOR, true);
    mockChallengesEnabled = true;
    sendEventMock.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
    experiments.setEnabled(experiments.LESSON_TUTOR, false);
  });

  it('reports a recap card click with its position', () => {
    renderContainer();
    fireEvent.click(screen.getByRole('button', {name: 'skip'}));

    expect(sendEventMock).toHaveBeenCalledWith(
      EVENTS.TUTOR_PLUS_RECAP_CARD_VIEWED,
      {lesson_id: LESSON_DATA.lessonId, card_index: 1}
    );
    expect(screen.getByText('levels-attempted')).toBeInTheDocument();
  });

  it('does not report auto-advance or arrow-key navigation', () => {
    renderContainer();
    act(() => jest.runOnlyPendingTimers());
    act(() => fireEvent.keyDown(window, {key: 'ArrowRight'}));

    expect(sendEventMock).not.toHaveBeenCalled();
  });

  it.each(['practice', 'challenge'])(
    'reports choosing %s on the next-step screen',
    choice => {
      renderContainer('next-step');
      fireEvent.click(screen.getByRole('button', {name: choice}));

      expect(sendEventMock).toHaveBeenCalledWith(
        EVENTS.TUTOR_PLUS_NEXT_STEP_CHOSEN,
        {lesson_id: LESSON_DATA.lessonId, choice, source: 'next_step_screen'}
      );
      expect(screen.getByText('intervention')).toBeInTheDocument();
    }
  );

  it.each([
    ['keep practicing', 'keep_practicing', 'intervention'],
    ['test skills', 'test_skills', 'skills-check'],
  ])(
    'reports "%s" on the pre-skills-check screen',
    (buttonName, choice, nextScreen) => {
      renderContainer('pre-skills-check');
      fireEvent.click(screen.getByRole('button', {name: buttonName}));

      expect(sendEventMock).toHaveBeenCalledWith(
        EVENTS.TUTOR_PLUS_PRACTICE_NEXT_CHOSEN,
        {lesson_id: LESSON_DATA.lessonId, choice}
      );
      expect(screen.getByText(nextScreen)).toBeInTheDocument();
    }
  );
});
