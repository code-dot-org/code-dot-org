import {buildTutorContext} from '@cdo/apps/adaptive/ai/tutorContext';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';

const step = (id: string, project?: true): LevelStep => ({
  id,
  title: `Step ${id}`,
  kind: 'level',
  level: `level-${id}`,
  ...(project && {project}),
});

const checkedStep: LevelStep = {
  ...step('p2', true),
  validation: {
    condition: 'The page has a heading.',
    measures: {skillId: 'prompting'},
  },
};
const thresholds = {effortCheckAt: 4, replyLimit: 8};

const checkpoint = (
  id: string,
  title: string,
  steps: LevelStep[],
  skillIds?: string[]
): Checkpoint => ({
  id,
  title,
  description: `About ${title}.`,
  steps,
  ...(skillIds && {skillIds}),
});

const intro = checkpoint('intro', 'Introduction', [step('i1')]);
const prompting = checkpoint(
  'prompting',
  'Basics of Prompting',
  [step('p1'), step('p2', true)],
  ['prompting']
);
const structure = checkpoint('structure', 'Structure of a Webpage', [
  step('s1'),
]);

const pathway: Pathway = {
  formatVersion: 4,
  id: 'sample',
  title: 'Build a website with AI',
  objective: 'Build a personal website with an AI build partner.',
  project: {templateLevel: 'template', description: 'A one-page site.'},
  skills: {
    prompting: {
      id: 'prompting',
      title: 'Prompting with structure',
      description: 'Ask for one thing at a time.',
    },
  },
  checkpoints: [intro, prompting, structure],
};

const statusMap = {
  intro: 'complete',
  prompting: 'inProgress',
  structure: 'locked',
} as const;

describe('buildTutorContext', () => {
  it("tells the tutor how the latest check of the step's work went", () => {
    const context = buildTutorContext({
      pathway,
      checkpoint: prompting,
      step: step('p2', true),
      statusMap: {},
      latestValidationAttempt: {
        at: '2026-10-22T10:00:00Z',
        pass: false,
        evidenceLevel: 1,
        reason: 'Add one more detail to your prompt.',
      },
    });
    expect(context).toContain(
      'The latest check of the student\'s work on this step did not meet the step\'s goal yet. They were told: "Add one more detail to your prompt."'
    );
    expect(context).toContain(
      'Help them get there without doing the step for them.'
    );
  });

  it('briefs the tutor on how a checked step is checked and where the chat alone opens Continue', () => {
    const context = buildTutorContext({
      pathway,
      checkpoint: prompting,
      step: checkedStep,
      statusMap,
      instructions: '**Add a heading** to the top of the page.',
      checkedBuilds: 1,
      chatThresholds: thresholds,
    });

    expect(context).toContain('How this step is checked:');
    expect(context).toContain('- Goal: The page has a heading.');
    expect(context).toContain(
      '- The instructions the student sees:\n**Add a heading** to the top of the page.'
    );
    expect(context).toContain(
      'The step is checked only when the student accepts a build from you; talking alone is never checked. If they are struggling, or unsure why they have not met the goal yet, offer to build.'
    );
    expect(context).toContain(
      '- Code the student types into the editor is never checked either. If they changed the code themselves and nothing happened, tell them so and offer a build that keeps their changes.'
    );
    expect(context).toContain(
      '- Continue is locked until a build meets the goal.'
    );
    expect(context).toContain(
      'never to be told to the student: after 4 of your replies a judge reads this chat and opens Continue if the student is genuinely trying, after 8 replies Continue opens regardless, and after 3 accepted builds that miss the goal Continue opens as well; builds checked so far: 1.'
    );
  });

  it.each([
    ['validationPassed', 'a build met the goal'],
    ['failedValidations', 'several builds were checked without passing'],
    ['effortDemonstrated', 'shown real effort in this chat'],
    ['limitReached', 'talked with you long enough'],
  ] as const)(
    'says Continue is open, and why (%s), in place of the thresholds',
    (reason, text) => {
      const context = buildTutorContext({
        pathway,
        checkpoint: prompting,
        step: checkedStep,
        statusMap,
        continueUnlocked: reason,
        chatThresholds: thresholds,
      });
      expect(context).toContain('Continue is already open on this step:');
      expect(context).toContain(text);
      expect(context).not.toContain('Continue is locked');
      expect(context).not.toContain('never to be told');
    }
  );

  it('says nothing about checking on a step with no validation block', () => {
    const context = buildTutorContext({
      pathway,
      checkpoint: prompting,
      step: step('p2', true),
      statusMap,
      instructions: 'Do this.',
      chatThresholds: thresholds,
    });
    expect(context).not.toContain('How this step is checked');
    expect(context).not.toContain('Do this.');
  });

  it('describes the pathway, the checkpoint, the step and progress', () => {
    const context = buildTutorContext({
      pathway,
      checkpoint: prompting,
      step: prompting.steps[0] as LevelStep,
      statusMap,
    });

    expect(context).toContain('Pathway: Build a website with AI');
    expect(context).toContain(
      'Objective: Build a personal website with an AI build partner.'
    );
    expect(context).toContain(
      '- Prompting with structure: Ask for one thing at a time.'
    );
    expect(context).toContain(
      'Current checkpoint (2 of 3): Basics of Prompting'
    );
    expect(context).toContain('About Basics of Prompting.');
    expect(context).toContain(
      'Skills in this checkpoint: Prompting with structure'
    );
    expect(context).toContain('Step 1 of 2: Step p1');
    expect(context).toContain('- Completed: Introduction');
    expect(context).toContain('- In progress: Basics of Prompting');
    expect(context).toContain('- Not started: Structure of a Webpage');
    expect(context).not.toContain('pathway project');
  });

  it('describes the project on a project step', () => {
    const context = buildTutorContext({
      pathway,
      checkpoint: prompting,
      step: prompting.steps[1] as LevelStep,
      statusMap,
      project: {name: 'My Website', description: 'A site about my team.'},
    });

    expect(context).toContain('editing their pathway project, "My Website"');
    expect(context).toContain('Project description: A site about my team.');
  });

  it('copes with an unnamed project', () => {
    const context = buildTutorContext({
      pathway,
      checkpoint: prompting,
      step: prompting.steps[1] as LevelStep,
      statusMap,
      project: {},
    });

    expect(context).toContain('editing their pathway project, their project.');
    expect(context).not.toContain('Project description');
  });

  it('places the project view outside any checkpoint', () => {
    const projectStep = step('project', true);
    const context = buildTutorContext({
      pathway,
      checkpoint: checkpoint('project', 'My Project', [projectStep]),
      step: projectStep,
      statusMap,
      project: {name: 'My Website'},
    });

    expect(context).toContain(
      'working on their project outside any checkpoint'
    );
    expect(context).not.toContain('Current checkpoint');
    expect(context).toContain('- In progress: Basics of Prompting');
  });
});
