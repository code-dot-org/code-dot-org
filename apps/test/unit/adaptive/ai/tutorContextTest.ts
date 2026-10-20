import {buildTutorContext} from '@cdo/apps/adaptive/ai/tutorContext';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';

const step = (id: string, project?: true): LevelStep => ({
  id,
  title: `Step ${id}`,
  kind: 'level',
  level: `level-${id}`,
  ...(project && {project}),
});

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
