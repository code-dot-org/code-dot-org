import {z} from 'zod';

import {
  AdaptiveContentError,
  checkpointsInProgressionOrder,
  parsePathway,
  parsePathwaySource,
  pathwaySchema,
  pathwaySourceSchema,
  pathwayStandards,
  referenceProblems,
  referencedSkillIds,
} from '@cdo/apps/adaptive/schema';

const resolvedStandard = {
  framework: 'csta2026',
  shortcode: 'MS-ALG-PS-05',
  frameworkName: 'CSTA',
  description: 'Do the thing.',
};

// The served pathway's input type gives tests typed access. Corruptions the
// type forbids go through Object.assign.
type Raw = z.input<typeof pathwaySchema>;
type RawSource = z.input<typeof pathwaySourceSchema>;
type Step = Raw['checkpoints'][number]['steps'][number];

// What the server inlines for a level it found.
const levelProperties = (id: number, name: string, template?: string) => ({
  id,
  name,
  appName: 'weblab2' as const,
  longInstructions: `Instructions for ${name}.`,
  projectTemplateLevelName: template,
});

const panels = (id: string): Step => ({
  id,
  title: id,
  kind: 'panels',
  panels: [{key: `${id}-1`, imageUrl: 'hello.png', text: 'Hello'}],
});

const served = (): Raw => ({
  formatVersion: 4,
  id: 'sample',
  title: 'Sample',
  objective: 'Learn things.',
  project: {
    templateLevel: 'web-template',
    description: 'A site.',
    levelProperties: levelProperties(1, 'web-template'),
  },
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
          kind: 'level',
          level: 'web-project-basics',
          project: true,
          levelProperties: levelProperties(
            2,
            'web-project-basics',
            'web-template'
          ),
        },
        {
          id: 'practice',
          title: 'Practice',
          kind: 'level',
          level: 'web-sandbox-basics',
          instructions: 'Try it.',
          levelProperties: levelProperties(3, 'web-sandbox-basics'),
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

function withoutLevelProperties<T extends {levelProperties?: unknown}>(
  object: T
): Omit<T, 'levelProperties'> {
  const copy = {...object};
  delete copy.levelProperties;
  return copy;
}

// The authored file behind served(): no server-filled fields.
const source = (): RawSource => {
  const raw = served();
  return {
    ...raw,
    project: withoutLevelProperties(raw.project),
    skills: {
      ...raw.skills,
      prompting: {
        ...raw.skills.prompting,
        standards: [{framework: 'csta2026', shortcode: 'MS-ALG-PS-05'}],
      },
    },
    checkpoints: raw.checkpoints.map(checkpoint => ({
      ...checkpoint,
      steps: checkpoint.steps.map(step =>
        step.kind === 'level' ? withoutLevelProperties(step) : step
      ),
    })),
  };
};

function problemsOf(raw: unknown): string[] {
  try {
    parsePathway(raw);
    return [];
  } catch (e) {
    if (e instanceof AdaptiveContentError) return e.problems;
    throw e;
  }
}

function sourceProblemsOf(raw: unknown): string[] {
  try {
    parsePathwaySource(raw);
    return [];
  } catch (e) {
    if (e instanceof AdaptiveContentError) return e.problems;
    throw e;
  }
}

describe('parsePathway', () => {
  it('accepts valid content and keeps the inlined level properties', () => {
    const pathway = parsePathway(served());
    const build = pathway.checkpoints[1].steps[0];
    expect(build.kind === 'level' && build.levelProperties?.id).toBe(2);
    expect(pathway.project.levelProperties?.appName).toBe('weblab2');
  });

  it('accepts a level step the server could not resolve', () => {
    const raw = served();
    const build = raw.checkpoints[1].steps[0];
    if (build.kind !== 'level') throw new Error('fixture changed');
    delete build.levelProperties;
    const parsed = parsePathway(raw).checkpoints[1].steps[0];
    expect(parsed.kind === 'level' && parsed.levelProperties).toBeUndefined();
  });

  it('rejects level properties without the keys every lab needs', () => {
    const raw = served();
    const build = raw.checkpoints[1].steps[0];
    if (build.kind !== 'level') throw new Error('fixture changed');
    Object.assign(build, {levelProperties: {name: 'x'}});
    expect(problemsOf(raw)).toEqual([
      expect.stringMatching(/^checkpoints\.1\.steps\.0\.levelProperties:/),
    ]);
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
  it('accepts an authored file with bare standard and level references', () => {
    expect(() => parsePathwaySource(source())).not.toThrow();
  });

  it('rejects server-filled fields in an authored file', () => {
    expect(sourceProblemsOf(served())).toEqual([
      expect.stringMatching(/^project:/),
      expect.stringMatching(/^skills\.prompting\.standards\.0:/),
      expect.stringMatching(/^checkpoints\.1\.steps\.0:/),
      expect.stringMatching(/^checkpoints\.1\.steps\.1:/),
    ]);
  });

  it('does not check references', () => {
    const raw = source();
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

  it('flags a project step whose level does not share the template', () => {
    const raw = served();
    const build = raw.checkpoints[1].steps[0];
    if (build.kind !== 'level') throw new Error('fixture changed');
    build.levelProperties = levelProperties(2, 'web-project-basics');
    expect(problemsOf(raw)).toEqual([
      "checkpoints.basics.steps.build: marked project but level 'web-project-basics' does not use template 'web-template'",
    ]);
  });

  it('flags a sandbox step whose level shares the template', () => {
    const raw = served();
    const practice = raw.checkpoints[1].steps[1];
    if (practice.kind !== 'level') throw new Error('fixture changed');
    practice.levelProperties = levelProperties(
      3,
      'web-sandbox-basics',
      'web-template'
    );
    expect(problemsOf(raw)).toEqual([
      "checkpoints.basics.steps.practice: level 'web-sandbox-basics' uses the project template but the step is not marked project",
    ]);
  });

  it('treats the template level itself as sharing the project', () => {
    const raw = served();
    const build = raw.checkpoints[1].steps[0];
    if (build.kind !== 'level') throw new Error('fixture changed');
    build.level = 'web-template';
    build.levelProperties = levelProperties(1, 'web-template');
    expect(problemsOf(raw)).toEqual([]);
  });

  it('does not check the flag on a level the server could not resolve', () => {
    const raw = served();
    const build = raw.checkpoints[1].steps[0];
    if (build.kind !== 'level') throw new Error('fixture changed');
    delete build.levelProperties;
    expect(problemsOf(raw)).toEqual([]);
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
