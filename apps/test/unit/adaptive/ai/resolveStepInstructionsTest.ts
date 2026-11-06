import {generate, moderateOutput} from '@cdo/apps/adaptive/ai/generate';
import {
  INSTRUCTIONS_PROMPT_VERSION,
  buildInstructionsPrompt,
} from '@cdo/apps/adaptive/ai/instructionsPrompt';
import {resolveStepInstructions} from '@cdo/apps/adaptive/ai/resolveStepInstructions';
import {generateInputsHash} from '@cdo/apps/adaptive/progress/model';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';
import {AichatContext} from '@cdo/apps/aichat/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/generate', () => ({
  generate: jest.fn(),
  moderateOutput: jest.fn(async () => 'ok'),
}));
const mockLogWarning = jest.fn();
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getMetricsReporter: () => ({logWarning: mockLogWarning}),
    }),
  },
}));
const mockGenerate = generate as jest.Mock;
const mockModerateOutput = moderateOutput as jest.Mock;

const step: LevelStep = {
  id: 'build',
  title: 'Build',
  kind: 'level',
  level: 'project-level',
  project: true,
  instructionsPrompt: 'Make it personal.',
};
const checkpoint: Checkpoint = {
  id: 'basics',
  title: 'Basics',
  description: 'First steps.',
  steps: [step],
};
const pathway: Pathway = {
  formatVersion: 4,
  id: 'p',
  title: 'Build a website',
  objective: 'Make a site.',
  project: {templateLevel: 'tmpl', description: 'A site.'},
  skills: {},
  checkpoints: [checkpoint],
};
const context: AichatContext = {
  clientType: AiChatClientTypes.ADAPTIVE,
  currentLevelId: 1,
  scriptId: null,
  channelId: undefined,
};
const sources = {source: {folders: {}, files: {}}};
const projectInfo = {name: 'Cat Corner', description: 'Cats.'};
// The cache is keyed by the full prompt; the project has no files, so its
// source code summary is empty.
const inputsHash = generateInputsHash(
  buildInstructionsPrompt({
    pathway,
    checkpoint,
    step,
    project: {...projectInfo, sourceCode: ''},
    fallback: 'Authored.',
  })
);

const resolve = (
  overrides: Partial<Parameters<typeof resolveStepInstructions>[0]> = {}
) => {
  const saveGeneratedInstructions = jest.fn();
  const result = resolveStepInstructions({
    pathway,
    checkpoint,
    step,
    projectInfo,
    sources,
    authoredInstructions: 'Authored.',
    generatedInstructions: undefined,
    saveGeneratedInstructions,
    aichatContext: context,
    ...overrides,
  });
  return {result, saveGeneratedInstructions};
};

describe('resolveStepInstructions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the authored text for a step without a prompt, without generating', async () => {
    const {result} = resolve({
      step: {...step, instructionsPrompt: undefined},
    });

    expect(await result).toBe('Authored.');
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('returns the authored text while the project is still loading', async () => {
    const {result} = resolve({sources: undefined});

    expect(await result).toBe('Authored.');
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('returns cached instructions whose hash matches, without generating', async () => {
    const {result} = resolve({
      generatedInstructions: {instructions: 'Cached.', inputsHash},
    });

    expect(await result).toBe('Cached.');
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('generates, caches with the inputs hash and trace id, and returns the result when the cache is stale', async () => {
    mockGenerate.mockResolvedValue({
      output: {instructions: 'Fresh.'},
      traceId: 'trace-1',
    });
    const {result, saveGeneratedInstructions} = resolve({
      generatedInstructions: {instructions: 'Old.', inputsHash: 'deadbeef'},
    });

    expect(await result).toBe('Fresh.');
    expect(saveGeneratedInstructions).toHaveBeenCalledWith('build', {
      instructions: 'Fresh.',
      inputsHash,
      traceId: 'trace-1',
    });
  });

  it('names the trace and passes the step ids and inputs hash as its metadata', async () => {
    mockGenerate.mockResolvedValue({});
    const {result} = resolve();
    await result;

    expect(mockGenerate.mock.calls[0][0]).toMatchObject({
      trace: {
        name: 'adaptive-instructions',
        metadata: {
          pathwayId: 'p',
          checkpointId: 'basics',
          stepId: 'build',
          inputsHash,
          promptVersion: INSTRUCTIONS_PROMPT_VERSION,
        },
      },
    });
  });

  it('moderates the generated text before showing it, and returns the authored text, caching nothing, when it does not clear', async () => {
    mockGenerate.mockResolvedValue({
      output: {instructions: 'Rude.'},
      traceId: 'trace-1',
    });
    mockModerateOutput.mockResolvedValueOnce('flagged');
    const {result, saveGeneratedInstructions} = resolve();

    expect(await result).toBe('Authored.');
    expect(mockModerateOutput).toHaveBeenCalledWith('Rude.', context);
    expect(saveGeneratedInstructions).not.toHaveBeenCalled();
    expect(mockLogWarning).toHaveBeenCalledWith(
      expect.objectContaining({
        moderation: 'flagged',
        stepId: 'build',
        traceId: 'trace-1',
      })
    );
  });

  it('returns the authored text and caches nothing when generation yields nothing', async () => {
    mockGenerate.mockResolvedValue({traceId: 'trace-1'});
    const {result, saveGeneratedInstructions} = resolve();

    expect(await result).toBe('Authored.');
    expect(saveGeneratedInstructions).not.toHaveBeenCalled();
  });
});
