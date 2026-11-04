import {
  PROJECT_PROMPT_VERSION,
  buildProjectPrompt,
  projectOutputSchema,
} from '@cdo/apps/adaptive/ai/projectPrompt';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';

const step: LevelStep = {
  id: 'generated',
  title: 'Your generated site',
  kind: 'level',
  level: 'generated-level',
  project: true,
  projectPrompt: 'A one-page site with a hero and a call-to-action.',
};
const checkpoint: Checkpoint = {
  id: 'intro',
  title: 'Intro',
  description: 'Start here.',
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
const plan = {
  answers: [
    {
      slot: 'what',
      question: 'What will you make?',
      answer: 'A site about my dog Rex.',
      typed: true,
    },
  ],
};
const files = [
  {id: '1', name: 'index.html', contents: '<h1>Hi</h1>', folderId: '0'},
];

describe('PROJECT_PROMPT_VERSION', () => {
  it('is the date the wording last changed', () => {
    expect(PROJECT_PROMPT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('buildProjectPrompt', () => {
  it('carries the brief, the answers and the template files', () => {
    const prompt = buildProjectPrompt({
      pathway,
      checkpoint,
      step,
      plan,
      files,
    });
    expect(prompt).toContain(
      'A one-page site with a hero and a call-to-action.'
    );
    expect(prompt).toContain(
      'Q: What will you make?\nA: A site about my dog Rex.'
    );
    expect(prompt).toContain('filename: index.html\n```\n<h1>Hi</h1>\n```');
    expect(prompt).toContain('Objective: Make a site.');
    expect(prompt).not.toContain("The student's plan");
  });

  it('carries the plan sentence when given one', () => {
    const prompt = buildProjectPrompt({
      pathway,
      checkpoint,
      step,
      plan: {...plan, sentence: 'A site about Rex for me.'},
      files,
    });
    expect(prompt).toContain(
      "The student's plan, as they saw it before asking for this build:\nA site about Rex for me."
    );
  });
});

describe('projectOutputSchema', () => {
  it('needs a name, a description and at least one file', () => {
    expect(
      projectOutputSchema.safeParse({
        name: 'Rex Rules',
        description: 'A site about Rex.',
        files: [{name: 'index.html', contents: '<h1>Rex</h1>'}],
      }).success
    ).toBe(true);
    expect(
      projectOutputSchema.safeParse({
        name: 'Rex Rules',
        description: 'x',
        files: [],
      }).success
    ).toBe(false);
  });
});
