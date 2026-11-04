import {
  VALIDATION_PROMPT_VERSION,
  buildValidationPrompt,
  verdictSchema,
} from '@cdo/apps/adaptive/ai/validation/prompt';
import {Checkpoint, LevelStep, Pathway, Skill} from '@cdo/apps/adaptive/types';

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
const skill: Skill = {
  id: 'build',
  title: 'Build with AI',
  description: 'Steering AI.',
  evidenceLevels: {
    0: 'Nothing yet',
    1: 'Asks for one thing',
    2: 'Asks with details',
  },
};
const pathway: Pathway = {
  formatVersion: 4,
  id: 'p',
  title: 'Build a website',
  objective: 'Make a site.',
  project: {templateLevel: 'tmpl', description: 'A site.'},
  skills: {build: skill},
  checkpoints: [checkpoint],
};

const prompt = (
  overrides: Partial<Parameters<typeof buildValidationPrompt>[0]> = {}
) =>
  buildValidationPrompt({
    pathway,
    checkpoint,
    step,
    condition: step.validation!.condition,
    skill,
    instructions: 'Ask for a heading with the site name.',
    project: {name: 'Bakery', description: 'Bread.'},
    work: {
      at: 1700,
      change: '=== index.html ===\n<h1>Bakery</h1>',
      process: 'Student: Add a heading\nTutor: Done.',
      project: '<h1>Bakery</h1>',
    },
    ...overrides,
  });

describe('VALIDATION_PROMPT_VERSION', () => {
  it('is the date the wording last changed', () => {
    expect(VALIDATION_PROMPT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('buildValidationPrompt', () => {
  it('puts the condition, the skill scale, the work and how it came about before the rules', () => {
    const text = prompt();
    const order = [
      'What the student was asked to do:\nAsk for a heading with the site name.',
      'Their whole project right now:\n<h1>Bakery</h1>',
      'THE WORK',
      'Student: Add a heading\nTutor: Done.',
      '=== index.html ===',
      'CONDITION\nThe page has a heading.',
      'EVIDENCE LEVELS for the skill "Build with AI": Steering AI.\n- 0: Nothing yet\n- 1: Asks for one thing\n- 2: Asks with details',
      'RULES',
    ].map(part => text.indexOf(part));
    expect(order.every(i => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('has the reason open with Success, Almost or Not quite', () => {
    const text = prompt();
    expect(text).toContain('"Success!" when the condition is met');
    expect(text).toContain('"Almost!" when the condition is not met but');
    expect(text).toContain('"Not quite!" when the condition is not met and');
  });

  it('says so when nothing was recorded and nothing changed', () => {
    const text = prompt({work: {at: 1700, change: ''}});
    expect(text).toContain('Nothing was recorded.');
    expect(text).toContain('Nothing changed.');
  });
});

describe('verdictSchema', () => {
  it('takes a pass, a whole evidence level and a reason, and nothing less', () => {
    expect(
      verdictSchema.safeParse({pass: true, evidenceLevel: 2, reason: 'Good.'})
        .success
    ).toBe(true);
    expect(
      verdictSchema.safeParse({pass: true, evidenceLevel: 1.5, reason: 'Good.'})
        .success
    ).toBe(false);
    expect(
      verdictSchema.safeParse({pass: 'yes', evidenceLevel: 2, reason: 'Good.'})
        .success
    ).toBe(false);
    expect(
      verdictSchema.safeParse({pass: true, evidenceLevel: 2}).success
    ).toBe(false);
  });
});
