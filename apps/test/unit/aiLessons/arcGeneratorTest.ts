import {loggedGenerateText} from '@cdo/apps/aiLessons/aiLog';
import {coerceArc, generateLessonArc} from '@cdo/apps/aiLessons/arcGenerator';
import {HubStep, LabStep, LessonPlan} from '@cdo/apps/aiLessons/types';

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
  id: 'tree',
  title: 'Tree lesson',
  objective: '',
  authorInputs: {prompt: ''},
  arcSpec: {
    standards: [
      {id: 'engage-ai-3', text: 'Engage with AI 3: Evaluate outputs.'},
      {id: 'manage-ai-4', text: 'Manage AI 4: Monitor AI use.'},
    ],
    guidance: 'At most 2 hubs.',
    exampleProjects: ['a fan site'],
    generateAfter: 'assessment',
    rejoinAt: 'finalize',
  },
  steps: [
    {
      id: 'assessment',
      kind: 'questions',
      title: 'What do you know?',
      questions: [{id: 'q1', type: 'freeResponse', prompt: 'p'}],
    },
    {
      id: 'authored-practice',
      kind: 'lab',
      title: 'Authored practice',
      labType: 'weblab2',
      description: 'the exemplar span',
      validation: 'none',
    },
    {
      id: 'finalize',
      kind: 'lab',
      title: 'Finalize',
      labType: 'weblab2',
      description: '',
      validation: 'none',
      next: 'end',
    },
  ],
};

const spec = lesson.arcSpec!;

describe('coerceArc', () => {
  it('namespaces ids, remaps references, and maps standards', () => {
    const steps = coerceArc(lesson, spec, [
      {
        kind: 'hub',
        id: 'My Hub!',
        title: 'Hub',
        paths: [
          {
            id: 'p1',
            title: 'Path',
            objective: 'obj',
            standardId: 'engage-ai-3',
            steps: ['practice one', 'ghost-step'],
          },
        ],
      },
      {kind: 'lab', id: 'practice one', title: 'Practice'},
    ]);

    const hub = steps[0] as HubStep;
    expect(hub.id).toBe('arc-my-hub');
    expect(hub.generated).toBe(true);
    // Path steps remapped through the model's own names; dangling ids
    // dropped; standardId resolved to the contract's verbatim text.
    expect(hub.paths[0].steps).toEqual(['arc-practice-one']);
    expect(hub.paths[0].standard).toBe('Engage with AI 3: Evaluate outputs.');
    // A hub with no authored next routes to the rejoin step.
    expect(hub.next).toBe('finalize');
    expect(steps[1].id).toBe('arc-practice-one');
  });

  it('drops hubs whose paths all came back empty', () => {
    const steps = coerceArc(lesson, spec, [
      {
        kind: 'hub',
        id: 'hub',
        title: 'Hub',
        paths: [{id: 'p1', title: 'P', standardId: 'x', steps: ['nope']}],
      },
      {kind: 'panels', id: 'outro', title: 'Outro', panels: [{caption: 'c'}]},
    ]);
    expect(steps.map(s => s.kind)).toEqual(['panels']);
  });

  it('fills lab defaults and terminates the arc at the rejoin step', () => {
    const steps = coerceArc(lesson, spec, [
      {
        kind: 'lab',
        id: 'ex',
        title: 'Exercise',
        successCriteria: 'works',
        starterFiles: [{filename: 'index.html', contents: '<p>x</p>'}],
      },
    ]);
    const lab = steps[0] as LabStep;
    expect(lab).toMatchObject({
      id: 'arc-ex',
      labType: 'weblab2',
      sourceMode: 'sandbox',
      validation: 'tutor',
      aiPrompting: 'free',
      generated: true,
      starterFiles: {'index.html': '<p>x</p>'},
      // Last arc step with no next: forced to the rejoin step so the
      // arc never runs off the end of the array.
      next: 'finalize',
    });
  });

  it('returns empty for unusable output', () => {
    expect(coerceArc(lesson, spec, [])).toEqual([]);
  });
});

describe('generateLessonArc', () => {
  beforeEach(() => mockGenerate.mockReset());

  it('briefs the model with the contract, exemplar, and diagnostics', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        steps: [
          {kind: 'panels', id: 'intro', title: 'Hi', panels: [{caption: 'c'}]},
        ],
      },
    });
    const steps = await generateLessonArc({
      lesson,
      inputs: {
        'a-footer': {
          questionId: 'a-footer',
          stepId: 'assessment',
          prompt: 'Where is the footer?',
          answer: 'At the very bottom',
          outcome: 'correct',
          attempts: 1,
          at: '2026-01-01T00:00:00Z',
        },
      },
    });
    expect(steps).toHaveLength(1);
    expect(steps[0].id).toBe('arc-intro');
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('engage-ai-3: Engage with AI 3');
    expect(args.system).toContain('At most 2 hubs.');
    expect(args.system).toContain('a fan site');
    // The authored span between the markers is the exemplar.
    expect(args.system).toContain(
      '[lab] Authored practice — the exemplar span'
    );
    expect(args.system).not.toContain('[lab] Finalize');
    expect(args.prompt).toContain(
      '"Where is the footer?" → At the very bottom (correct on the first try)'
    );
  });

  it('returns empty without an arcSpec or on unusable output', async () => {
    expect(
      await generateLessonArc({
        lesson: {...lesson, arcSpec: undefined},
        inputs: {},
      })
    ).toEqual([]);
    mockGenerate.mockResolvedValue({output: {steps: []}});
    expect(await generateLessonArc({lesson, inputs: {}})).toEqual([]);
  });
});
