import {generate} from '@cdo/apps/adaptive/ai/generate';
import {
  INSTRUCTIONS_PROMPT_VERSION,
  buildInstructionsPrompt,
} from '@cdo/apps/adaptive/ai/instructionsPrompt';
import {resolveStepInstructions} from '@cdo/apps/adaptive/ai/resolveStepInstructions';
import {generateInputsHash} from '@cdo/apps/adaptive/progress/model';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';
import {AichatContext} from '@cdo/apps/aichat/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/generate', () => ({generate: jest.fn()}));
const mockGenerate = generate as jest.Mock;

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
  const updateStepContext = jest.fn();
  const result = resolveStepInstructions({
    pathway,
    checkpoint,
    step,
    projectInfo,
    sources,
    authoredInstructions: 'Authored.',
    stepContext: undefined,
    updateStepContext,
    aichatContext: context,
    ...overrides,
  });
  return {result, updateStepContext};
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
      stepContext: {generated: {instructions: 'Cached.', inputsHash}},
    });

    expect(await result).toBe('Cached.');
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('generates, caches with the inputs hash and trace id, and returns the result when the cache is stale', async () => {
    mockGenerate.mockResolvedValue({
      output: {instructions: 'Fresh.'},
      traceId: 'trace-1',
    });
    const {result, updateStepContext} = resolve({
      stepContext: {generated: {instructions: 'Old.', inputsHash: 'deadbeef'}},
    });

    expect(await result).toBe('Fresh.');
    expect(updateStepContext).toHaveBeenCalledWith('build', {
      generated: {instructions: 'Fresh.', inputsHash, traceId: 'trace-1'},
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

  it('returns the authored text and caches nothing when generation yields nothing', async () => {
    mockGenerate.mockResolvedValue({traceId: 'trace-1'});
    const {result, updateStepContext} = resolve();

    expect(await result).toBe('Authored.');
    expect(updateStepContext).not.toHaveBeenCalled();
  });
});
