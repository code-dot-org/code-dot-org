import {generate, isAdaptiveAiEnabled} from '@cdo/apps/adaptive/ai/generate';
import {
  validateStep,
  withOpener,
} from '@cdo/apps/adaptive/ai/validation/validateStep';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/generate', () => ({
  generate: jest.fn(),
  isAdaptiveAiEnabled: jest.fn(() => true),
}));
const mockGenerate = generate as jest.Mock;
const mockEnabled = isAdaptiveAiEnabled as jest.Mock;

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
  skills: {
    build: {
      id: 'build',
      title: 'Build with AI',
      description: 'Steering AI.',
      evidenceLevels: {0: 'Nothing', 1: 'Some', 3: 'Lots'},
    },
  },
  checkpoints: [checkpoint],
};
const options = {
  pathway,
  checkpoint,
  step,
  projectInfo: {name: 'Bakery', description: 'Bread.'},
  instructions: 'Add a heading.',
  work: {
    at: 1700,
    change: '=== index.html ===\n<h1>Bakery</h1>',
    process: 'Student: Add a heading',
    project: '<h1>Bakery</h1>',
  },
  aichatContext: {
    clientType: AiChatClientTypes.ADAPTIVE,
    currentLevelId: 1,
    scriptId: 2,
    channelId: undefined,
  },
};

describe('validateStep', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    mockEnabled.mockReturnValue(true);
  });

  it('judges the work under the validation trace and shapes the verdict as an attempt', async () => {
    mockGenerate.mockResolvedValue({
      output: {pass: true, evidenceLevel: 3, reason: 'Success! Nice heading.'},
      traceId: 'trace-1',
    });
    const onJudging = jest.fn(() =>
      expect(mockGenerate).not.toHaveBeenCalled()
    );

    const attempt = await validateStep({
      ...options,
      instructionsTraceId: 'trace-0',
      onJudging,
    });

    expect(onJudging).toHaveBeenCalledTimes(1);
    expect(attempt).toEqual({
      pass: true,
      evidenceLevel: 3,
      reason: 'Success! Nice heading.',
      traceId: 'trace-1',
    });
    const call = mockGenerate.mock.calls[0][0];
    expect(call.trace.name).toBe('adaptive-validation');
    expect(call.trace.metadata).toMatchObject({
      pathwayId: 'p',
      checkpointId: 'basics',
      stepId: 'build',
      workAt: 1700,
      instructionsTraceId: 'trace-0',
    });
    expect(call.prompt).toContain('=== index.html ===\n<h1>Bakery</h1>');
    expect(call.prompt).toContain('Student: Add a heading');
  });

  it('rates at the highest described evidence level at or below what the judge said', async () => {
    mockGenerate.mockResolvedValue({
      output: {pass: false, evidenceLevel: 2, reason: 'Not yet.'},
    });
    expect((await validateStep(options))?.evidenceLevel).toBe(1);

    mockGenerate.mockResolvedValue({
      output: {pass: false, evidenceLevel: 9, reason: 'Not yet.'},
    });
    expect((await validateStep(options))?.evidenceLevel).toBe(3);

    mockGenerate.mockResolvedValue({
      output: {pass: false, evidenceLevel: -2, reason: 'Not yet.'},
    });
    expect((await validateStep(options))?.evidenceLevel).toBe(0);
  });

  it('opens the reason with a word that fits the verdict when the judge did not', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        pass: false,
        evidenceLevel: 1,
        reason: 'Success! Add a heading.',
      },
    });
    expect((await validateStep(options))?.reason).toBe(
      'Not quite! Add a heading.'
    );
  });

  it('records nothing, and never says it is judging, when the judge gives no verdict, the step has no validation, the skill has no evidence levels, or adaptive AI is off', async () => {
    const onJudging = jest.fn();
    mockGenerate.mockResolvedValue({traceId: 'trace-2'});
    expect(await validateStep({...options, onJudging})).toBeUndefined();
    expect(onJudging).toHaveBeenCalledTimes(1);

    mockGenerate.mockResolvedValue({
      output: {pass: true, evidenceLevel: 1, reason: 'Fine.'},
    });
    const {validation, ...plain} = step;
    expect(
      await validateStep({...options, step: plain, onJudging})
    ).toBeUndefined();
    const unscaled = {
      ...pathway,
      skills: {build: {...pathway.skills.build, evidenceLevels: undefined}},
    };
    expect(
      await validateStep({...options, pathway: unscaled, onJudging})
    ).toBeUndefined();
    mockEnabled.mockReturnValue(false);
    expect(await validateStep({...options, onJudging})).toBeUndefined();
    expect(onJudging).toHaveBeenCalledTimes(1);
    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(validation).toBeDefined();
  });
});

describe('withOpener', () => {
  it("keeps the judge's opener when it fits the verdict", () => {
    expect(withOpener(true, 'Success! Nice.')).toBe('Success! Nice.');
    expect(withOpener(false, 'Almost! One more.')).toBe('Almost! One more.');
    expect(withOpener(false, 'Not quite! Add it.')).toBe('Not quite! Add it.');
  });

  it('puts the default opener in place of a missing or unfitting one', () => {
    expect(withOpener(true, 'Nice heading.')).toBe('Success! Nice heading.');
    expect(withOpener(false, '  Add a heading. ')).toBe(
      'Not quite! Add a heading.'
    );
    expect(withOpener(true, 'Almost! Nice.')).toBe('Success! Nice.');
    expect(withOpener(false, 'Success!')).toBe('Not quite!');
  });
});
