import reducer, {
  AdaptiveState,
  answerRecorded,
  progressLoading,
  progressReady,
  selectProgress,
  stepCompleted,
} from '@cdo/apps/adaptive/adaptiveRedux';
import {AdaptiveContent, AdaptiveProgress} from '@cdo/apps/adaptive/types';

const content: AdaptiveContent = {
  formatVersion: 1,
  id: 'sample',
  title: 'Sample',
  steps: [
    {id: 'intro', kind: 'panels', title: 'Intro', panels: []},
    {id: 'check', kind: 'question', title: 'Check', questions: []},
    {id: 'wrap', kind: 'panels', title: 'Wrap', panels: []},
  ],
};

const saved: AdaptiveProgress = {
  currentStepId: 'check',
  path: ['intro', 'check'],
  completedStepIds: ['intro'],
  answers: {},
  completed: false,
};

function loading(): AdaptiveState {
  return reducer(undefined, progressLoading({scriptId: 7, levelId: 42}));
}

describe('adaptiveRedux', () => {
  it('starts at the first step when nothing is saved', () => {
    const state = reducer(
      loading(),
      progressReady({scriptId: 7, levelId: 42, content, saved: null})
    );
    expect(state.status).toBe('ready');
    expect(state.currentStepId).toBe('intro');
    expect(state.path).toEqual(['intro']);
    expect(state.completed).toBe(false);
  });

  it('resumes saved progress', () => {
    const state = reducer(
      loading(),
      progressReady({scriptId: 7, levelId: 42, content, saved})
    );
    expect(selectProgress(state)).toEqual(saved);
  });

  it('starts over when the saved step no longer exists', () => {
    const state = reducer(
      loading(),
      progressReady({
        scriptId: 7,
        levelId: 42,
        content,
        saved: {...saved, currentStepId: 'deleted'},
      })
    );
    expect(state.currentStepId).toBe('intro');
    expect(state.completedStepIds).toEqual([]);
  });

  it('ignores a load result for a different level', () => {
    const state = reducer(
      loading(),
      progressReady({scriptId: 7, levelId: 43, content, saved})
    );
    expect(state.status).toBe('loading');
    expect(state.currentStepId).toBeNull();
  });

  it('keeps the latest answer per question', () => {
    const first = {
      questionId: 'q',
      stepId: 'check',
      optionIds: ['a'],
      outcome: 'incorrect' as const,
      attempts: 1,
      at: 't1',
    };
    let state = reducer(loading(), answerRecorded(first));
    state = reducer(
      state,
      answerRecorded({
        ...first,
        optionIds: ['b'],
        outcome: 'correct',
        attempts: 2,
      })
    );
    expect(state.answers.q.optionIds).toEqual(['b']);
    expect(state.answers.q.attempts).toBe(2);
  });

  it('advances to the next step on completion', () => {
    let state = reducer(
      loading(),
      progressReady({scriptId: 7, levelId: 42, content, saved: null})
    );
    state = reducer(
      state,
      stepCompleted({stepId: 'intro', nextStepId: 'check'})
    );
    expect(state.completedStepIds).toEqual(['intro']);
    expect(state.currentStepId).toBe('check');
    expect(state.path).toEqual(['intro', 'check']);
    expect(state.completed).toBe(false);
  });

  it('marks the lesson complete when there is no next step', () => {
    let state = reducer(
      loading(),
      progressReady({scriptId: 7, levelId: 42, content, saved})
    );
    state = reducer(state, stepCompleted({stepId: 'check', nextStepId: null}));
    state = reducer(state, stepCompleted({stepId: 'check', nextStepId: null}));
    expect(state.completedStepIds).toEqual(['intro', 'check']);
    expect(state.currentStepId).toBe('check');
    expect(state.completed).toBe(true);
  });
});
