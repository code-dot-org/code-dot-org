import {loggedGenerateText} from '@cdo/apps/aiLessons/aiLog';
import {judgeBranchCondition} from '@cdo/apps/aiLessons/branchJudge';
import {NavContext} from '@cdo/apps/aiLessons/navigation';
import {LessonPlan} from '@cdo/apps/aiLessons/types';

// Keep the test hermetic: no gateway, no model registry.  jest hoists
// these mocks above the imports.
jest.mock('@cdo/apps/aiLessons/aiLog', () => ({
  loggedGenerateText: jest.fn(),
}));
jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  getModel: jest.fn(() => 'model'),
}));
jest.mock('@cdo/apps/aiLessons/aiGatewaySetup', () => ({
  initAiLessonsGatewayContext: jest.fn(),
}));

const mockGenerate = loggedGenerateText as jest.Mock;

const lesson: LessonPlan = {
  formatVersion: 2,
  title: 'Judge test',
  objective: '',
  authorInputs: {prompt: ''},
  steps: [
    {
      id: 'ui-shell',
      kind: 'lab',
      title: 'Build your UI shell',
      labType: 'weblab2',
      description: 'generate the UI shell',
      validation: 'none',
    },
  ],
};

const aiJudge = {
  stepId: 'ui-shell',
  criteria: 'Prompts name specific sections.',
};

function ctx(inputs: NavContext['inputs']): NavContext {
  return {lesson, currentStepId: 'ui-shell', path: ['ui-shell'], inputs};
}

const promptRecord = {
  questionId: 'ai-prompt-ui-shell-1',
  stepId: 'ui-shell',
  prompt: 'AI build prompt (Build your UI shell)',
  answer: 'A header with my band name, a hero, and three cards below.',
  at: '2026-01-01T00:00:00Z',
};

describe('judgeBranchCondition', () => {
  beforeEach(() => mockGenerate.mockReset());

  it('is a deterministic no-match with nothing recorded for the step', async () => {
    expect(await judgeBranchCondition(aiJudge, ctx(undefined))).toBe(false);
    expect(
      await judgeBranchCondition(
        aiJudge,
        ctx({other: {...promptRecord, stepId: 'elsewhere'}})
      )
    ).toBe(false);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('sends the criteria and the step record; returns the verdict', async () => {
    mockGenerate.mockResolvedValue({
      output: {pass: true, reason: 'named sections'},
    });
    expect(await judgeBranchCondition(aiJudge, ctx({p1: promptRecord}))).toBe(
      true
    );
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('Prompts name specific sections.');
    expect(args.system).toContain('Build your UI shell');
    expect(args.prompt).toContain('three cards below');
  });

  it('coerces a missing or falsy verdict to false', async () => {
    mockGenerate.mockResolvedValue({output: {reason: 'vague'}});
    expect(await judgeBranchCondition(aiJudge, ctx({p1: promptRecord}))).toBe(
      false
    );
    mockGenerate.mockResolvedValue({output: {pass: false, reason: 'vague'}});
    expect(await judgeBranchCondition(aiJudge, ctx({p1: promptRecord}))).toBe(
      false
    );
  });

  it('lets an LLM failure propagate (the resolver treats it as no match)', async () => {
    mockGenerate.mockRejectedValue(new Error('gateway down'));
    await expect(
      judgeBranchCondition(aiJudge, ctx({p1: promptRecord}))
    ).rejects.toThrow('gateway down');
  });
});
