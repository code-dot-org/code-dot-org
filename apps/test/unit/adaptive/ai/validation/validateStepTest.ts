import {generate} from '@cdo/apps/adaptive/ai/generate';
import {validateStep} from '@cdo/apps/adaptive/ai/validation/validateStep';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/generate', () => ({generate: jest.fn()}));
const mockGenerate = generate as jest.Mock;

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
  beforeEach(() => mockGenerate.mockReset());

  it('judges the work under the validation trace and shapes the verdict as an attempt', async () => {
    mockGenerate.mockResolvedValue({
      output: {pass: true, evidenceLevel: 3, reason: 'Nice heading.'},
      traceId: 'trace-1',
    });

    const attempt = await validateStep(options);

    expect(attempt).toEqual({
      pass: true,
      evidenceLevel: 3,
      reason: 'Nice heading.',
      traceId: 'trace-1',
    });
    const call = mockGenerate.mock.calls[0][0];
    expect(call.trace.name).toBe('adaptive-validation');
    expect(call.trace.metadata).toMatchObject({
      pathwayId: 'p',
      checkpointId: 'basics',
      stepId: 'build',
      workAt: 1700,
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

  it('records nothing when the judge gives no verdict, the step has no validation, or the skill has no evidence levels', async () => {
    mockGenerate.mockResolvedValue({traceId: 'trace-2'});
    expect(await validateStep(options)).toBeUndefined();

    mockGenerate.mockResolvedValue({
      output: {pass: true, evidenceLevel: 1, reason: 'Fine.'},
    });
    const {validation, ...plain} = step;
    expect(await validateStep({...options, step: plain})).toBeUndefined();
    const unscaled = {
      ...pathway,
      skills: {build: {...pathway.skills.build, evidenceLevels: undefined}},
    };
    expect(await validateStep({...options, pathway: unscaled})).toBeUndefined();
    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(validation).toBeDefined();
  });
});
