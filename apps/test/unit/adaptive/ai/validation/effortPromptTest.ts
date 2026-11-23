import {
  EFFORT_PROMPT_VERSION,
  buildEffortPrompt,
  effortVerdictSchema,
} from '@cdo/apps/adaptive/ai/validation/effortPrompt';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';

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
  project: {
    templateLevel: 'tmpl',
    description: 'A site.',
    levelProperties: {
      appName: 'weblab2',
    } as Pathway['project']['levelProperties'],
  },
  skills: {},
  checkpoints: [checkpoint],
};
const input = {
  pathway,
  checkpoint,
  step,
  condition: step.validation!.condition,
  instructions: 'Ask for a heading.',
  transcript: 'Student: Add a heading\nTutor: Here is one.',
};

describe('EFFORT_PROMPT_VERSION', () => {
  it('is the date the wording last changed', () => {
    expect(EFFORT_PROMPT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('buildEffortPrompt', () => {
  it('puts the lab, the step, the goal and the chat before the rules', () => {
    const prompt = buildEffortPrompt(input);
    const order = [
      'How the student works in this lab',
      'Pathway: Build a website',
      'Step: Build the header',
      'Ask for a heading.',
      'GOAL\nThe page has a heading.',
      'THE CHAT\nStudent: Add a heading\nTutor: Here is one.',
      'RULES',
    ].map(text => prompt.indexOf(text));
    expect(order.every(i => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('asks for a verdict that is never shown to the student', () => {
    const prompt = buildEffortPrompt(input);
    expect(prompt).toContain('not a message to the student');
    expect(prompt).toContain('Return exactly sufficient and reason');
  });

  it('says so when nothing was said', () => {
    const prompt = buildEffortPrompt({...input, transcript: ''});
    expect(prompt).toContain('THE CHAT\nNothing was said.');
  });
});

describe('effortVerdictSchema', () => {
  it('takes a verdict and a reason, and nothing less', () => {
    expect(
      effortVerdictSchema.safeParse({sufficient: true, reason: 'Asked twice.'})
        .success
    ).toBe(true);
    expect(effortVerdictSchema.safeParse({sufficient: 'yes'}).success).toBe(
      false
    );
  });
});
