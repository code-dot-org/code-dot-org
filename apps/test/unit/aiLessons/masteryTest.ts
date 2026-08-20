import {loggedGenerateText} from '@cdo/apps/aiLessons/aiLog';
import {evaluatePathMastery} from '@cdo/apps/aiLessons/mastery';
import {LessonPlan, SkillPath} from '@cdo/apps/aiLessons/types';

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

const path: SkillPath = {
  id: 'debugging',
  title: 'Debugging',
  objective: 'Find and fix bugs in web code.',
  standard:
    'Manage AI 4: Monitor and evaluate AI use throughout a problem-solving process.',
  steps: ['fixit', 'reflect'],
};

const lesson: LessonPlan = {
  formatVersion: 2,
  title: 'Tree lesson',
  objective: '',
  authorInputs: {prompt: ''},
  steps: [
    {id: 'hub', kind: 'hub', title: 'Skill map', paths: [path]},
    {
      id: 'fixit',
      kind: 'lab',
      title: 'Fix it!',
      labType: 'weblab2',
      description: 'fix the planted bugs',
      validation: 'tutor',
    },
    {
      id: 'reflect',
      kind: 'questions',
      title: 'Reflect',
      questions: [{id: 'strategy', type: 'freeResponse', prompt: 'How?'}],
    },
  ],
};

const inputs = {
  'ai-prompt-fixit-1': {
    questionId: 'ai-prompt-fixit-1',
    stepId: 'fixit',
    prompt: 'AI build prompt (Fix it!)',
    answer: 'Fix the misspelled colr property in style.css',
    outcome: 'kept' as const,
    at: '2026-01-01T00:00:00Z',
  },
  strategy: {
    questionId: 'strategy',
    stepId: 'reflect',
    prompt: 'How?',
    answer: 'I read the symptoms first.',
    at: '2026-01-02T00:00:00Z',
  },
};

describe('evaluatePathMastery', () => {
  beforeEach(() => mockGenerate.mockReset());

  it('judges the path evidence against objective and standard', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        reasoning: 'Targeted fixes.',
        gaps: [],
        mastered: true,
      },
    });

    const verdict = await evaluatePathMastery({
      lesson,
      path,
      inputs,
      observations: {
        fixit: {summary: 'Worked methodically.', score: 3, at: 'x'},
      },
    });

    expect(verdict.mastered).toBe(true);
    expect(verdict.reasoning).toBe('Targeted fixes.');
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('OBJECTIVE: Find and fix bugs in web code.');
    expect(args.system).toContain('STANDARD: Manage AI 4');
    expect(args.prompt).toContain('Step "Fix it!"');
    expect(args.prompt).toContain(
      'Fix the misspelled colr property in style.css [kept]'
    );
    expect(args.prompt).toContain('Observation (3/4): Worked methodically.');
    expect(args.prompt).toContain('I read the symptoms first.');
  });

  it('coerces a not-mastered verdict with gaps', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        reasoning: 'Only one bug fixed.',
        gaps: ['Never located the wrong button id', 42],
        mastered: false,
      },
    });
    const verdict = await evaluatePathMastery({lesson, path, inputs});
    expect(verdict.mastered).toBe(false);
    expect(verdict.gaps).toEqual(['Never located the wrong button id', '42']);
  });
});
