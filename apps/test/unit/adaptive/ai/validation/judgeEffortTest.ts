import {isAdaptiveAiAvailable} from '@cdo/apps/adaptive/ai/access';
import {generate} from '@cdo/apps/adaptive/ai/generate';
import {judgeEffort} from '@cdo/apps/adaptive/ai/validation/judgeEffort';
import {sendAiStaticFallbackUsed} from '@cdo/apps/adaptive/metricsHelpers';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/access', () => ({
  isAdaptiveAiAvailable: jest.fn(() => true),
}));
jest.mock('@cdo/apps/adaptive/ai/generate', () => ({
  generate: jest.fn(),
}));
jest.mock('@cdo/apps/adaptive/metricsHelpers', () => ({
  ...jest.requireActual('@cdo/apps/adaptive/metricsHelpers'),
  sendAiStaticFallbackUsed: jest.fn(),
}));
const mockGenerate = generate as jest.Mock;
const mockAvailable = isAdaptiveAiAvailable as jest.Mock;

const step: LevelStep = {
  id: 'build',
  title: 'Build the header',
  kind: 'level',
  level: 'project-level',
  project: true,
  validation: {
    condition: 'The page has a heading.',
    measures: {skillId: 'build'},
  },
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
const options = {
  pathway,
  checkpoint,
  step,
  instructions: 'Add a heading.',
  transcript: 'Student: What is a heading?\nTutor: The title at the top.',
  replies: 5,
  aichatContext: {
    clientType: AiChatClientTypes.ADAPTIVE,
    currentLevelId: 1,
    scriptId: 2,
    channelId: undefined,
  },
};

describe('judgeEffort', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    mockAvailable.mockReturnValue(true);
    (sendAiStaticFallbackUsed as jest.Mock).mockClear();
  });

  it('rates the chat on the fast model under an effort trace, keeping its reason out of the answer', async () => {
    mockGenerate.mockResolvedValue({
      output: {sufficient: true, reason: 'Asked what a heading is.'},
      traceId: 'trace-1',
    });

    const check = await judgeEffort(options);

    expect(check).toEqual({pass: true, traceId: 'trace-1'});
    const call = mockGenerate.mock.calls[0][0];
    expect(call.trace.name).toBe('adaptive-effort');
    expect(call.model).toBe('gemini-3.1-flash-lite');
    expect(call.trace.metadata).toMatchObject({
      pathwayId: 'p',
      checkpointId: 'basics',
      stepId: 'build',
      replies: 5,
    });
    expect(call.prompt).toContain('Student: What is a heading?');
    expect(call.prompt).toContain('GOAL\nThe page has a heading.');
  });

  it('answers no when the chat shows no real effort', async () => {
    mockGenerate.mockResolvedValue({
      output: {sufficient: false, reason: 'Only hellos.'},
      traceId: 'trace-1',
    });
    expect(await judgeEffort(options)).toEqual({
      pass: false,
      traceId: 'trace-1',
    });
  });

  it('answers nothing, and counts the fallback, when the judge gives no output', async () => {
    mockGenerate.mockResolvedValue({traceId: 'trace-1'});
    expect(await judgeEffort(options)).toBeUndefined();
    expect(sendAiStaticFallbackUsed).toHaveBeenCalledWith(
      'effort',
      'modelErrorOrInvalidOutput',
      checkpoint,
      step
    );
  });

  it('never runs without a validation block or with adaptive AI off', async () => {
    expect(
      await judgeEffort({...options, step: {...step, validation: undefined}})
    ).toBeUndefined();
    mockAvailable.mockReturnValue(false);
    expect(await judgeEffort(options)).toBeUndefined();
    expect(mockGenerate).not.toHaveBeenCalled();
  });
});
