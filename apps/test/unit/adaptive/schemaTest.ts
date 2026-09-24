import {z} from 'zod';

import {
  AdaptiveContentError,
  checkpointsInProgressionOrder,
  parsePathway,
  parsePathwaySource,
  pathwaySchema,
  pathwayStandards,
  referenceProblems,
  referencedSkillIds,
} from '@cdo/apps/adaptive/schema';

const resolvedStandard = {
  framework: 'csta2026',
  shortcode: 'MS-ALG-PS-05',
  frameworkName: 'CSTA',
  description: 'Use an AI tool.',
};

// The served pathway's input type gives tests typed access. Corruptions the
// type forbids go through Object.assign.
type Raw = z.input<typeof pathwaySchema>;
type Step = Raw['checkpoints'][number]['steps'][number];

const panels = (id: string): Step => ({
  id,
  title: id,
  kind: 'panels',
  panels: [{caption: 'Hello'}],
});

const served = (): Raw => ({
  formatVersion: 4,
  id: 'sample',
  title: 'Sample',
  objective: 'Learn things.',
  project: {lab: {type: 'weblab2'}, description: 'A site.'},
  skills: {
    prompting: {
      id: 'prompting',
      title: 'Prompting',
      description: 'Prompt well.',
      standards: [resolvedStandard],
    },
    css: {id: 'css', title: 'CSS', description: 'Style.'},
  },
  checkpoints: [
    {
      id: 'intro',
      title: 'Introduction',
      description: 'Start here.',
      steps: [
        panels('welcome'),
        {
          id: 'quiz',
          title: 'Quiz',
          kind: 'questions',
          questions: [
            {
              id: 'q1',
              type: 'multipleChoice',
              text: 'Pick one',
              options: [
                {id: 'a', label: 'A', correct: true},
                {id: 'b', label: 'B'},
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'basics',
      title: 'Basics',
      description: 'Basics of prompting.',
      skillIds: ['prompting'],
      requires: ['intro'],
      steps: [
        {
          id: 'build',
          title: 'Build',
          kind: 'lab',
          lab: {type: 'weblab2'},
          instructions: 'Build it.',
        },
        {
          id: 'practice',
          title: 'Practice',
          kind: 'lab',
          sourceMode: 'practice',
          lab: {type: 'weblab2', starterFiles: {'index.html': '<p>hi</p>'}},
          instructions: 'Try it.',
        },
      ],
    },
    {
      id: 'style',
      title: 'Style',
      description: 'CSS.',
      skillIds: ['css'],
      requires: ['intro'],
      steps: [panels('css-intro')],
    },
  ],
});

function problemsOf(raw: unknown): string[] {
  try {
    parsePathway(raw);
    return [];
  } catch (e) {
    if (e instanceof AdaptiveContentError) return e.problems;
    throw e;
  }
}

describe('parsePathway', () => {
  it('accepts valid content and fills defaults', () => {
    const pathway = parsePathway(served());
    const build = pathway.checkpoints[1].steps[0];
    expect(build.kind === 'lab' && build.sourceMode).toBe('project');
  });

  it('reports the path of a schema violation', () => {
    const raw = served();
    raw.checkpoints[0].steps = [];
    expect(problemsOf(raw)).toEqual([
      expect.stringMatching(/^checkpoints\.0\.steps:/),
    ]);
  });

  it('accepts a served standard the server could not resolve', () => {
    const raw = served();
    raw.skills.prompting.standards = [
      {framework: 'csta2026', shortcode: 'MS-NOPE'},
    ];
    expect(parsePathway(raw).skills.prompting.standards).toEqual([
      {framework: 'csta2026', shortcode: 'MS-NOPE'},
    ]);
  });

  it('rejects an unknown format version', () => {
    expect(problemsOf({...served(), formatVersion: 3})).toEqual([
      expect.stringMatching(/^formatVersion:/),
    ]);
  });

  it('rejects an unknown key anywhere, so a misspelled field cannot vanish', () => {
    const raw = served();
    Object.assign(raw.checkpoints[0], {requries: ['x']});
    expect(problemsOf(raw)).toEqual([
      expect.stringMatching(/^checkpoints\.0:/),
    ]);
  });

  it('rejects pathway-level steps', () => {
    expect(problemsOf({...served(), steps: []})).toEqual([
      expect.stringMatching(/^\(root\):/),
    ]);
  });
});

describe('parsePathwaySource', () => {
  it('accepts an authored file with bare standard references', () => {
    const raw = served();
    const source = {
      ...raw,
      skills: {
        ...raw.skills,
        prompting: {
          ...raw.skills.prompting,
          standards: [{framework: 'csta2026', shortcode: 'MS-ALG-PS-05'}],
        },
      },
    };
    expect(() => parsePathwaySource(source)).not.toThrow();
  });

  it('does not check references', () => {
    const raw = served();
    raw.skills.prompting.standards = undefined;
    raw.checkpoints[1].requires = ['nope'];
    expect(() => parsePathwaySource(raw)).not.toThrow();
    expect(problemsOf(raw)).toEqual([
      "checkpoints.basics.requires: unknown checkpoint 'nope'",
    ]);
  });
});

describe('referenceProblems', () => {
  it('finds nothing wrong with consistent content', () => {
    expect(referenceProblems(parsePathway(served()))).toEqual([]);
  });

  it('flags an unknown skill id', () => {
    const raw = served();
    raw.checkpoints[2].skillIds = ['html'];
    expect(problemsOf(raw)).toEqual([
      "checkpoints.style.skillIds: unknown skill 'html'",
    ]);
  });

  it('flags a skill key that does not match its id', () => {
    const raw = served();
    raw.skills.css.id = 'styles';
    expect(problemsOf(raw)).toEqual([
      "skills.css: id 'styles' does not match key",
    ]);
  });

  it('flags a graph with no root', () => {
    const raw = served();
    raw.checkpoints[0] = {...raw.checkpoints[0], requires: ['basics']};
    expect(problemsOf(raw)).toEqual([
      'checkpoints: no root (every checkpoint has requires)',
      'checkpoints.intro: can never unlock; its requires never lead back to a root',
      'checkpoints.basics: can never unlock; its requires never lead back to a root',
      'checkpoints.style: can never unlock; its requires never lead back to a root',
    ]);
  });

  it('flags every checkpoint stranded behind a cycle, even with a root present', () => {
    const raw = served();
    raw.checkpoints[1].requires = ['intro', 'style'];
    raw.checkpoints[2].requires = ['basics'];
    expect(problemsOf(raw)).toEqual([
      'checkpoints.basics: can never unlock; its requires never lead back to a root',
      'checkpoints.style: can never unlock; its requires never lead back to a root',
    ]);
  });

  it('does not double-report a checkpoint whose requires is unknown', () => {
    const raw = served();
    raw.checkpoints[2].requires = ['nowhere'];
    expect(problemsOf(raw)).toEqual([
      "checkpoints.style.requires: unknown checkpoint 'nowhere'",
    ]);
  });

  it('flags duplicate checkpoint and step ids', () => {
    const raw = served();
    raw.checkpoints[2].id = 'basics';
    raw.checkpoints[2].steps = [panels('build')];
    expect(problemsOf(raw)).toEqual([
      'checkpoints: ids must be unique',
      'checkpoints: step ids must be unique across checkpoints',
    ]);
  });

  it('flags a project-mode step whose lab differs from the project or has starter files', () => {
    const raw = served();
    const build = raw.checkpoints[1].steps[0];
    if (build.kind !== 'lab') throw new Error('fixture changed');
    build.lab = {type: 'weblab2', starterFiles: {'a.html': ''}};
    expect(problemsOf(raw)).toEqual([
      expect.stringMatching(
        /^checkpoints\.basics\.steps\.build: project step cannot declare starterFiles/
      ),
    ]);
  });
});

describe('standards helpers', () => {
  it('referencedSkillIds lists skills once, in progression order rather than file order', () => {
    const raw = served();
    raw.checkpoints[0].skillIds = ['css'];
    raw.checkpoints[2].skillIds = ['css', 'prompting'];
    raw.checkpoints.reverse();
    expect(referencedSkillIds(parsePathway(raw))).toEqual(['css', 'prompting']);
  });

  it('checkpointsInProgressionOrder puts roots first and keeps ties in file order', () => {
    const raw = served();
    raw.checkpoints.reverse();
    expect(
      checkpointsInProgressionOrder(parsePathway(raw)).map(c => c.id)
    ).toEqual(['intro', 'style', 'basics']);
  });

  it("pathwayStandards unions the referenced skills' standards without duplicates", () => {
    const raw = served();
    raw.skills.css.standards = [
      resolvedStandard,
      {...resolvedStandard, shortcode: 'MS-PRO-RD-18'},
    ];
    expect(pathwayStandards(parsePathway(raw)).map(s => s.shortcode)).toEqual([
      'MS-ALG-PS-05',
      'MS-PRO-RD-18',
    ]);
  });
});
