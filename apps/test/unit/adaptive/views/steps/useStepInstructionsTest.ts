import {renderHook} from '@testing-library/react-hooks';

import {
  StepInstructionsOptions,
  resolveStepInstructions,
} from '@cdo/apps/adaptive/ai/resolveStepInstructions';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';
import {useStepInstructions} from '@cdo/apps/adaptive/views/steps/useStepInstructions';
import {AichatContext} from '@cdo/apps/aichat/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/resolveStepInstructions', () => ({
  resolveStepInstructions: jest.fn(),
}));
const mockResolve = resolveStepInstructions as jest.Mock;

const step: LevelStep = {
  id: 'build',
  title: 'Build',
  kind: 'level',
  level: 'l',
  project: true,
  instructionsPrompt: 'p',
};
const checkpoint: Checkpoint = {
  id: 'c',
  title: 'C',
  description: 'd',
  steps: [step],
};
const pathway: Pathway = {
  formatVersion: 4,
  id: 'p',
  title: 'T',
  objective: 'O',
  project: {templateLevel: 't', description: 'd'},
  skills: {},
  checkpoints: [checkpoint],
};
const aichatContext: AichatContext = {
  clientType: AiChatClientTypes.ADAPTIVE,
  currentLevelId: 1,
  scriptId: null,
  channelId: undefined,
};
const sources = {source: ''};
const base: StepInstructionsOptions = {
  pathway,
  checkpoint,
  step,
  projectInfo: {name: 'Cat Corner', description: 'Cats.'},
  sources,
  authoredInstructions: 'Authored.',
  stepContext: undefined,
  updateStepContext: jest.fn(),
  aichatContext,
};

describe('useStepInstructions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('stays unresolved and asks nothing while the project is loading', () => {
    const {result} = renderHook(() =>
      useStepInstructions({...base, sources: undefined})
    );

    expect(result.current.isResolved).toBe(false);
    expect(result.current.instructions).toBeUndefined();
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('is unresolved until the resolver answers, then resolved with its text', async () => {
    mockResolve.mockResolvedValue('Generated.');
    const {result, waitForNextUpdate} = renderHook(() =>
      useStepInstructions(base)
    );

    expect(result.current.isResolved).toBe(false);
    await waitForNextUpdate();

    expect(result.current.isResolved).toBe(true);
    expect(result.current.instructions).toBe('Generated.');
  });

  it('counts no text at all as resolved', async () => {
    mockResolve.mockResolvedValue(undefined);
    const {result, waitForNextUpdate} = renderHook(() =>
      useStepInstructions({...base, authoredInstructions: undefined})
    );

    await waitForNextUpdate();

    expect(result.current.isResolved).toBe(true);
    expect(result.current.instructions).toBeUndefined();
  });

  it('re-resolves when an input changes, keeping the old answer until the new one', async () => {
    mockResolve
      .mockResolvedValueOnce('First.')
      .mockResolvedValueOnce('Second.');
    const {result, rerender, waitForNextUpdate} = renderHook(
      props => useStepInstructions(props),
      {initialProps: base}
    );
    await waitForNextUpdate();
    expect(result.current.instructions).toBe('First.');

    rerender({...base, projectInfo: {name: 'Dog Den', description: 'Cats.'}});

    expect(result.current.isResolved).toBe(true);
    expect(result.current.instructions).toBe('First.');
    await waitForNextUpdate();
    expect(result.current.instructions).toBe('Second.');
    expect(mockResolve).toHaveBeenCalledTimes(2);
  });

  it('keeps its answer while re-resolving after an input change', async () => {
    mockResolve.mockResolvedValueOnce('First.').mockResolvedValueOnce('First.');
    const {result, rerender, waitForNextUpdate} = renderHook(
      props => useStepInstructions(props),
      {initialProps: base}
    );
    await waitForNextUpdate();

    // The cache write-back after a generation changes stepContext; the lab
    // must not lose its answer, and so unmount, while the hit is re-read.
    rerender({
      ...base,
      stepContext: {generated: {instructions: 'First.', inputsHash: 'x'}},
    });

    expect(result.current.isResolved).toBe(true);
    expect(result.current.instructions).toBe('First.');
    expect(mockResolve).toHaveBeenCalledTimes(2);
  });

  it('does not re-resolve for a render that changes no input', async () => {
    mockResolve.mockResolvedValue('Once.');
    const {result, rerender, waitForNextUpdate} = renderHook(
      props => useStepInstructions(props),
      {initialProps: base}
    );
    await waitForNextUpdate();

    // A fresh projectInfo object with the same strings is the same input.
    rerender({...base, projectInfo: {...base.projectInfo}});

    expect(result.current.isResolved).toBe(true);
    expect(mockResolve).toHaveBeenCalledTimes(1);
  });
});
