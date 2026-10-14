import {act, renderHook} from '@testing-library/react-hooks';

import {
  EMPTY_PROGRESS,
  Progress,
  checkpointStatus,
  getStatusMap,
  useProgress,
} from '@cdo/apps/adaptive/progress';
import {ProgressStore} from '@cdo/apps/adaptive/progress/progressStore';
import {Checkpoint, Pathway, Step} from '@cdo/apps/adaptive/types';
import {TestResults} from '@cdo/apps/constants';

const mockLogError = jest.fn();
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getMetricsReporter: () => ({logError: mockLogError})}),
  },
}));

const panels = (id: string): Step => ({
  id,
  title: id,
  kind: 'panels',
  panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
});

const checkpoint = (
  id: string,
  requires?: string[],
  steps: Step[] = [panels(`${id}-step`)]
): Checkpoint => ({id, title: id, description: id, requires, steps});

// Marks each checkpoint's single step complete or started.
const progressOf = (completed: string[], started: string[]): Progress => ({
  steps: {
    ...Object.fromEntries(
      started.map(id => [`${id}-step`, {status: 'started', timeSpent: 0}])
    ),
    ...Object.fromEntries(
      completed.map(id => [`${id}-step`, {status: 'complete', timeSpent: 0}])
    ),
  },
});

const pathway = {
  checkpoints: [
    checkpoint('intro'),
    checkpoint('a', ['intro']),
    checkpoint('b', ['intro', 'a']),
  ],
} as Pathway;

describe('checkpointStatus', () => {
  const status = (index: number, progress: Progress) =>
    checkpointStatus(pathway.checkpoints[index], pathway, progress);

  it('is available with no requires, locked until requires are complete', () => {
    const progress = progressOf([], []);
    expect(status(0, progress)).toBe('available');
    expect(status(1, progress)).toBe('locked');
  });

  it('needs every required checkpoint, not just one', () => {
    const progress = progressOf(['intro'], []);
    expect(status(1, progress)).toBe('available');
    expect(status(2, progress)).toBe('locked');
  });

  it('reports in progress once started and complete over everything else', () => {
    const progress = progressOf(['intro'], ['a', 'intro']);
    expect(status(1, progress)).toBe('inProgress');
    expect(status(0, progress)).toBe('complete');
  });

  it('is started by any step and complete only with its last step', () => {
    const level: Step = {id: 'try', title: 'Try', kind: 'level', level: 'x'};
    const multi = checkpoint('multi', undefined, [panels('one'), level]);
    const twoStep = {checkpoints: [multi]} as Pathway;
    const statusOf = (steps: Progress['steps']) =>
      checkpointStatus(multi, twoStep, {steps});

    expect(statusOf({one: {status: 'complete', timeSpent: 3}})).toBe(
      'inProgress'
    );
    expect(statusOf({try: {status: 'complete', timeSpent: 3}})).toBe(
      'complete'
    );
  });

  it('is not started by a step that holds only generated instructions', () => {
    const generatedInstructions = {instructions: 'Hi', inputsHash: 'ab'};
    const progress = {
      steps: {'intro-step': {timeSpent: 0, generatedInstructions}},
    };
    expect(checkpointStatus(pathway.checkpoints[0], pathway, progress)).toBe(
      'available'
    );
  });
});

describe('getStatusMap', () => {
  it('maps every checkpoint id to its status', () => {
    expect(getStatusMap(pathway, progressOf(['intro', 'a'], []))).toEqual({
      intro: 'complete',
      a: 'complete',
      b: 'available',
    });
  });
});

describe('useProgress', () => {
  const sandbox: Step = {
    id: 'try',
    title: 'Try',
    kind: 'level',
    level: 'sandbox',
    levelProperties: {id: 42},
  } as Step;
  const project: Step = {...sandbox, id: 'project'} as Step;
  const quiz: Step = {
    id: 'quiz',
    title: 'Quiz',
    kind: 'questions',
    questions: [],
  } as unknown as Step;
  const read = panels('read');
  const hookPathway = {
    checkpoints: [
      checkpoint('intro', undefined, [read, sandbox]),
      checkpoint('basics', ['intro'], [quiz]),
    ],
  } as Pathway;
  const key = {scriptId: 3, levelId: 5};

  const fakeStore = (loaded: Progress = EMPTY_PROGRESS) => ({
    load: jest.fn().mockResolvedValue(loaded),
    saveStep: jest.fn().mockResolvedValue(undefined),
    saveInstructions: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn().mockResolvedValue(undefined),
  });

  const renderProgress = async (
    store: ProgressStore,
    reportLevelStep = jest.fn().mockResolvedValue(undefined)
  ) => {
    const hook = renderHook(() =>
      useProgress(hookPathway, key, {store, reportLevelStep})
    );
    await hook.waitForNextUpdate();
    return {...hook, reportLevelStep};
  };

  beforeEach(() => mockLogError.mockReset());

  it('loads from the store before reporting statuses', async () => {
    const store = fakeStore(progressOf([], []));
    store.load.mockResolvedValue({
      steps: {try: {status: 'complete', timeSpent: 9}},
    });
    const {result, waitForNextUpdate} = renderHook(() =>
      useProgress(hookPathway, key, {store})
    );
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.statusMap).toEqual({
      intro: 'complete',
      basics: 'available',
    });
    expect(store.load).toHaveBeenCalledWith(key);
  });

  it('shows no progress and logs when the load fails', async () => {
    const store = fakeStore();
    store.load.mockRejectedValue(new Error('down'));
    const {result} = await renderProgress(store);
    expect(result.current.progress).toEqual(EMPTY_PROGRESS);
    expect(mockLogError).toHaveBeenCalled();
  });

  it('saves non-level steps to the store and updates state at once', async () => {
    const store = fakeStore();
    const {result, reportLevelStep} = await renderProgress(store);

    act(() => result.current.startStep(read));
    expect(result.current.statusMap.intro).toBe('inProgress');
    act(() => result.current.completeStep(read, 1500));

    expect(store.saveStep.mock.calls).toEqual([
      [key, 'read', {started: true}],
      [key, 'read', {completed: true, timeSinceLastSave: 1500}],
    ]);
    expect(result.current.progress?.steps.read).toEqual({
      status: 'complete',
      timeSpent: 2,
    });
    expect(reportLevelStep).not.toHaveBeenCalled();
  });

  it("reports level steps on their level and never the project screen's", async () => {
    const store = fakeStore();
    const {result, reportLevelStep} = await renderProgress(store);

    act(() => result.current.startStep(sandbox));
    act(() => result.current.leaveStep(sandbox, 2000));
    act(() => result.current.completeStep(sandbox, 500));
    act(() => result.current.startStep(project));
    act(() => result.current.completeStep(project, 500));

    expect(reportLevelStep.mock.calls).toEqual([
      [42, TestResults.LEVEL_STARTED, 0],
      [42, TestResults.LEVEL_STARTED, 2000],
      [42, TestResults.FREE_PLAY, 500],
    ]);
    expect(store.saveStep).not.toHaveBeenCalled();
    expect(result.current.statusMap.intro).toBe('complete');
    expect(result.current.progress?.steps.try.timeSpent).toBe(3);
    expect(result.current.progress?.steps.project).toBeUndefined();
  });

  it('logs a failed level report', async () => {
    const {result, reportLevelStep} = await renderProgress(fakeStore());
    reportLevelStep.mockRejectedValue(new Error('403'));

    await act(async () => result.current.completeStep(sandbox, 0));

    expect(mockLogError).toHaveBeenCalled();
  });

  it('keeps answers per question and marks the step submitted', async () => {
    const store = fakeStore();
    const {result} = await renderProgress(store);
    const wrong = {answerId: 'a', isCorrect: false};
    const right = {answerId: 'b', isCorrect: true};

    act(() => {
      result.current.saveAnswers(quiz, 1, [wrong], 1000);
      result.current.saveAnswers(quiz, 2, [right], 0);
    });
    act(() => result.current.saveAnswers(quiz, 1, [wrong, right], 0));

    expect(result.current.progress?.steps.quiz).toEqual({
      status: 'started',
      submitted: true,
      timeSpent: 1,
      answers: {1: [wrong, right], 2: [right]},
    });
    expect(result.current.stepContextMap.quiz).toEqual({
      answers: {1: [wrong, right], 2: [right]},
    });
    expect(store.saveStep).toHaveBeenLastCalledWith(key, 'quiz', {
      answers: {questionId: 1, list: [wrong, right]},
      timeSinceLastSave: 0,
    });
  });

  it('saves generated instructions with the step without starting it', async () => {
    const store = fakeStore();
    const {result} = await renderProgress(store);
    const generated = {instructions: 'Hi', inputsHash: 'ab'};

    act(() => result.current.updateStepContext('try', {generated}));

    expect(result.current.stepContextMap.try.generated).toEqual(generated);
    expect(result.current.statusMap.intro).toBe('available');
    expect(store.saveInstructions).toHaveBeenCalledWith(key, 'try', generated);
  });

  it('restores loaded generated instructions', async () => {
    const generatedInstructions = {instructions: 'Hi', inputsHash: 'ab'};
    const store = fakeStore({
      steps: {project: {timeSpent: 0, generatedInstructions}},
    });
    const {result} = await renderProgress(store);

    expect(result.current.stepContextMap.project.generated).toEqual(
      generatedInstructions
    );
  });
});
