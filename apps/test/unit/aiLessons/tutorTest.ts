import {loggedGenerateText} from '@cdo/apps/aiLessons/aiLog';
import {
  generateTutorReply,
  judgeFreeResponse,
  TutorContext,
} from '@cdo/apps/aiLessons/tutor';
import {LessonPlan, Step, stepShowsChecklist} from '@cdo/apps/aiLessons/types';

// Keep the test hermetic: no gateway, no model registry, no capability
// docs (which eagerly load the music toolbox at import time).  jest
// hoists these mocks above the imports.
jest.mock('@cdo/apps/aiLessons/aiLog', () => ({
  loggedGenerateText: jest.fn(),
}));
jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  getModel: jest.fn(() => 'model'),
}));
jest.mock('@cdo/apps/aiLessons/aiGatewaySetup', () => ({
  initAiLessonsGatewayContext: jest.fn(),
}));
jest.mock('@cdo/apps/aiLessons/labCapabilities', () => ({
  getCapabilitiesMarkdownFor: jest.fn(() => '(capabilities)'),
}));

const mockGenerate = loggedGenerateText as jest.Mock;

const projectStep: Step = {
  id: 'build',
  kind: 'lab',
  title: 'Build it',
  labType: 'weblab2',
  description: 'work on the project',
  validation: 'none',
};

const sandboxStep: Step = {
  ...projectStep,
  id: 'practice',
  sourceMode: 'sandbox',
};

const lesson: LessonPlan = {
  formatVersion: 2,
  title: 'Checklist lesson',
  objective: 'obj',
  steps: [projectStep, sandboxStep],
  checklist: [
    {id: 'header', label: 'Page has a header'},
    {id: 'image', label: 'At least one image'},
  ],
  authorInputs: {prompt: ''},
};

describe('stepShowsChecklist', () => {
  it('is true only on project-mode lab steps of a checklist lesson', () => {
    expect(stepShowsChecklist(lesson, projectStep)).toBe(true);
    expect(stepShowsChecklist(lesson, sandboxStep)).toBe(false);
    expect(stepShowsChecklist({...lesson, checklist: []}, projectStep)).toBe(
      false
    );
  });
});

function ctx(overrides: Partial<TutorContext> = {}): TutorContext {
  return {lesson, currentIndex: 0, ...overrides};
}

describe('generateTutorReply checklist handling', () => {
  beforeEach(() =>
    mockGenerate.mockReset().mockResolvedValue({
      output: {message: 'hi', action: 'stay'},
    })
  );

  it('carries the checklist and its state in the system prompt', async () => {
    await generateTutorReply(ctx({checklistState: {header: true}}), []);
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('PROJECT CHECKLIST');
    expect(args.system).toContain('[x] header: Page has a header');
    expect(args.system).toContain('[ ] image: At least one image');
  });

  it('omits the checklist section on sandbox steps', async () => {
    await generateTutorReply(ctx({currentIndex: 1}), []);
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).not.toContain('PROJECT CHECKLIST');
  });

  it('carries observations in the system prompt', async () => {
    await generateTutorReply(
      ctx({
        observations: {
          practice: {
            summary: 'Worked methodically through the bugs.',
            score: 3,
            at: '2026-01-01T00:00:00Z',
          },
        },
      }),
      []
    );
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('OBSERVATIONS');
    expect(args.system).toContain(
      'Build it (3/4): Worked methodically through the bugs.'
    );
  });

  it('labels practice-exercise inputs in the student context', async () => {
    await generateTutorReply(
      ctx({
        studentInputs: {
          'what-to-make': {
            questionId: 'what-to-make',
            stepId: 'interview',
            prompt: 'What do you want to make?',
            answer: 'a bakery site',
            at: '2026-01-01T00:00:00Z',
          },
          'ai-prompt-practice-1': {
            questionId: 'ai-prompt-practice-1',
            stepId: 'practice',
            prompt: 'AI build prompt (practice)',
            answer: 'a page for Nimbus, a weather app startup',
            at: '2026-01-02T00:00:00Z',
          },
        },
      }),
      []
    );
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain(
      'a page for Nimbus, a weather app startup [from a practice exercise — NOT their project]'
    );
    // The real project answer stays unlabeled.
    expect(args.system).toContain('→ a bakery site\n');
  });

  it("leaves the current practice step's own inputs unlabeled", async () => {
    await generateTutorReply(
      ctx({
        currentIndex: 1, // the sandbox step itself
        studentInputs: {
          'ai-prompt-practice-1': {
            questionId: 'ai-prompt-practice-1',
            stepId: 'practice',
            prompt: 'AI build prompt (practice)',
            answer: 'a page for Nimbus, a weather app startup',
            at: '2026-01-02T00:00:00Z',
          },
        },
      }),
      []
    );
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('a page for Nimbus, a weather app startup');
    expect(args.system).not.toContain('NOT their project');
  });

  it('tells the tutor about the build panel on prompting steps', async () => {
    const promptingLesson: LessonPlan = {
      ...lesson,
      steps: [{...projectStep, aiPrompting: 'free'} as Step, sandboxStep],
    };
    await generateTutorReply(ctx({lesson: promptingLesson}), []);
    expect(mockGenerate.mock.calls[0][1].system).toContain(
      'prompts an AI build partner in a separate'
    );
    // And stays silent about it when prompting is off.
    mockGenerate.mockClear();
    await generateTutorReply(ctx(), []);
    expect(mockGenerate.mock.calls[0][1].system).not.toContain(
      'AI build partner in a separate'
    );
  });

  it('coerces per-item verdicts, dropping malformed entries', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        message: 'nice header!',
        action: 'stay',
        checklist: [
          {id: 'header', done: true},
          {id: 'image', done: 'yes'},
          {done: false},
        ],
      },
    });
    const reply = await generateTutorReply(ctx(), []);
    expect(reply.checklist).toEqual([{id: 'header', done: true}]);
  });

  it('leaves checklist undefined when the model omits it', async () => {
    const reply = await generateTutorReply(ctx(), []);
    expect(reply.checklist).toBeUndefined();
  });
});

describe('judgeFreeResponse', () => {
  beforeEach(() => mockGenerate.mockReset());

  it('sends the question, criteria, and answer; coerces the verdict', async () => {
    mockGenerate.mockResolvedValue({
      output: {accepted: false, feedback: 'What picks the element?'},
    });
    const verdict = await judgeFreeResponse(
      ctx(),
      {
        id: 'q',
        type: 'freeResponse',
        prompt: 'What does a selector do?',
        validation: 'tutor',
        successCriteria: 'Mentions targeting elements.',
      },
      'it makes things blue'
    );
    const args = mockGenerate.mock.calls[0][1];
    expect(args.prompt).toContain('What does a selector do?');
    expect(args.prompt).toContain('Mentions targeting elements.');
    expect(args.prompt).toContain('it makes things blue');
    expect(verdict).toEqual({
      accepted: false,
      feedback: 'What picks the element?',
    });
  });
});

describe('skill-hub mastery framing', () => {
  beforeEach(() =>
    mockGenerate.mockReset().mockResolvedValue({
      output: {message: 'hi', action: 'stay'},
    })
  );

  const genStep: Step = {
    id: 'gen-debugging-1-1',
    kind: 'lab',
    title: 'One more bug hunt',
    labType: 'weblab2',
    description: 'targeted practice',
    validation: 'tutor',
    sourceMode: 'sandbox',
    generated: true,
  };

  const hubLesson: LessonPlan = {
    formatVersion: 2,
    title: 'Tree lesson',
    objective: '',
    authorInputs: {prompt: ''},
    steps: [
      {
        id: 'hub',
        kind: 'hub',
        title: 'Skill map',
        paths: [
          {
            id: 'debugging',
            title: 'Debugging',
            steps: ['practice-step', 'gen-debugging-1-1'],
          },
        ],
      },
      {...projectStep, id: 'practice-step'},
      genStep,
    ],
  };

  const mastery = {
    debugging: {
      mastered: false,
      reasoning: 'Only one bug fixed.',
      gaps: ['Never located the wrong button id'],
      at: '2026-01-03T00:00:00Z',
    },
  };

  it('narrates path mastery status on the hub', async () => {
    await generateTutorReply(
      ctx({lesson: hubLesson, currentIndex: 0, mastery}),
      []
    );
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain(
      '[status: not yet mastered; a targeted practice step was added]'
    );
    expect(args.system).toContain('frame it warmly');
  });

  it('briefs the tutor on a generated practice step', async () => {
    await generateTutorReply(
      ctx({lesson: hubLesson, currentIndex: 2, mastery}),
      []
    );
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('GENERATED for this student');
    expect(args.system).toContain('"Debugging" path');
    expect(args.system).toContain('gaps: Never located the wrong button id');
    expect(args.system).toContain('never as failure or punishment');
  });
});

describe('generated arc-step framing', () => {
  beforeEach(() =>
    mockGenerate.mockReset().mockResolvedValue({
      output: {message: 'hi', action: 'stay'},
    })
  );

  it('frames arc content as made-for-you, not remediation', async () => {
    const arcLesson: LessonPlan = {
      ...lesson,
      steps: [
        {...projectStep, id: 'arc-practice', generated: true} as Step,
        sandboxStep,
      ],
    };
    // No mastery verdict: this is personalized-arc content, and the
    // remediation framing (which implies a failed judgment) must not
    // appear.
    await generateTutorReply(ctx({lesson: arcLesson, currentIndex: 0}), []);
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('GENERATED for this student from their');
    expect(args.system).not.toContain('without\n  yet demonstrating');
  });
});
