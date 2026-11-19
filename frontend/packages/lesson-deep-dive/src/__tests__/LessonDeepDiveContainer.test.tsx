import {act, fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {vi} from 'vitest';

import LessonDeepDiveContainer from '../LessonDeepDiveContainer';
import {type LessonDeepDiveData} from '../types';

vi.mock('@code-dot-org/core/api', () => {
  const client = {transport: {request: vi.fn()}};
  return {useApiClient: () => client};
});

vi.mock('../WelcomeBox', () => ({default: () => <div>welcome</div>}));
vi.mock('../StudentLessonStats/LevelsAttemptedBox', () => ({
  default: () => <div>levels-attempted</div>,
}));
vi.mock('../StudentLessonStats/TimeSpentBox', () => ({
  default: () => <div>time-spent</div>,
}));
vi.mock('../StudentLessonStats/ValidatedLevelsBox', () => ({
  default: () => <div>validated-levels</div>,
}));
vi.mock('../LessonSummaryCard', () => ({
  default: () => <div>lesson-summary</div>,
}));
vi.mock('../PreSkillsCheck', () => ({
  default: () => <div>pre-skills-check</div>,
}));
vi.mock('../SkillsCheck/SkillsCheck', () => ({
  default: () => <div>skills-check</div>,
}));
vi.mock('../TutorSummaryBox', () => ({
  default: () => <div>tutor-summary</div>,
}));
vi.mock('../NextStepPicker', () => ({default: () => <div>next-step</div>}));
vi.mock('../Reflection/ReflectionBox', () => ({
  default: () => <div>reflection</div>,
}));
vi.mock('../ReviewModalities/InterventionBox', () => ({
  default: ({
    onModalitySelected,
  }: {
    onModalitySelected: (modality: string) => void;
  }) => (
    <button type="button" onClick={() => onModalitySelected('challenge')}>
      intervention
    </button>
  ),
}));

const onModalitySelected = vi.fn();
let challengesEnabled = true;

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
          element={
            <LessonDeepDiveContainer
              lessonDeepDiveData={LESSON_DATA}
              challengesEnabled={challengesEnabled}
              VideoPlayer={() => null}
              TutorChat={() => null}
              TutorFeedback={() => null}
              onModalitySelected={onModalitySelected}
            />
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LessonDeepDiveContainer story card sequence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    challengesEnabled = true;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts on the welcome card', () => {
    renderContainer();
    expect(screen.getByText('welcome')).toBeInTheDocument();
  });

  it('auto-advances to the next card when the timer fires', () => {
    renderContainer();
    act(() => vi.runOnlyPendingTimers());
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
      act(() => vi.runOnlyPendingTimers());
      expect(screen.getByText(card)).toBeInTheDocument();
    }
  });

  it('does not auto-advance past lesson-summary', () => {
    renderContainer();
    // advance through welcome → levels-attempted → time-spent → validated-levels → lesson-summary
    for (let i = 0; i < 4; i++) {
      act(() => vi.runOnlyPendingTimers());
    }
    expect(screen.getByText('lesson-summary')).toBeInTheDocument();
    // no pending timer should fire from lesson-summary
    act(() => vi.runOnlyPendingTimers());
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
    act(() => vi.runOnlyPendingTimers());
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
    challengesEnabled = true;
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

  it('reports the modality a student picks on the intervention screen', () => {
    renderContainer('intervention');
    fireEvent.click(screen.getByRole('button', {name: 'intervention'}));
    expect(onModalitySelected).toHaveBeenCalledWith('challenge');
  });

  it('falls back to welcome when :screenId is not a known screen', () => {
    renderContainer('not-a-real-screen');
    expect(screen.getByText('welcome')).toBeInTheDocument();
  });
});

describe('LessonDeepDiveContainer without challenges', () => {
  beforeEach(() => {
    challengesEnabled = false;
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
