import {
  AdaptiveContentError,
  parsePathway,
  parsePathwaySource,
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

// Fixtures are deliberately loose so tests can corrupt them freely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any;

const panels = (id: string): Raw => ({
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
  abilities: {
    aiBuilder: {
      id: 'aiBuilder',
      title: 'AI code builder',
      description: 'The AI writes code.',
      grants: 'aiPrompt',
    },
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
              prompt: 'Pick one',
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
      unlocks: ['aiBuilder'],
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

  it('rejects an unknown format version', () => {
    expect(problemsOf({...served(), formatVersion: 3})).toEqual([
      expect.stringMatching(/^formatVersion:/),
    ]);
  });

  it('rejects an unknown key anywhere, so a misspelled field cannot vanish', () => {
    const raw = served();
    raw.checkpoints[0].requries = ['x'];
    expect(problemsOf(raw)).toEqual([
      expect.stringMatching(/^checkpoints\.0:/),
    ]);
  });

  it('accepts saveAs on free-response questions only', () => {
    const raw = served();
    raw.checkpoints[0].steps[1].questions.push({
      id: 'name',
      type: 'freeResponse',
      prompt: 'Name?',
      saveAs: 'projectTitle',
    });
    expect(() => parsePathway(raw)).not.toThrow();
    raw.checkpoints[0].steps[1].questions[0].saveAs = 'projectTitle';
    expect(problemsOf(raw)).toEqual([
      expect.stringMatching(/^checkpoints\.0\.steps\.1\.questions\.0/),
    ]);
  });

  it('checks branch option ids, completes targets, and the recommended checkpoint', () => {
    const raw = served();
    raw.recommendedCheckpointId = 'nowhere';
    raw.checkpoints[0].steps[1].questions[0].branches = [
      {optionIds: ['a', 'z'], message: 'Thanks!'},
      {
        optionIds: ['b'],
        questions: [
          {
            id: 'follow',
            type: 'multipleChoice',
            prompt: 'Follow up?',
            options: [
              {id: 'x', label: 'X', correct: true},
              {id: 'y', label: 'Y'},
            ],
          },
        ],
        completes: 'missing',
      },
    ];
    expect(problemsOf(raw)).toEqual([
      "recommendedCheckpointId: unknown checkpoint 'nowhere'",
      "checkpoints.intro.steps.quiz.questions.q1.branches.0.optionIds: unknown option 'z'",
      "checkpoints.intro.steps.quiz.questions.q1.branches.1.completes: unknown checkpoint 'missing'",
    ]);
    raw.recommendedCheckpointId = 'basics';
    raw.checkpoints[0].steps[1].questions[0].branches[0].optionIds = ['a'];
    raw.checkpoints[0].steps[1].questions[0].branches[1].completes = 'style';
    expect(problemsOf(raw)).toEqual([]);
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
    raw.skills.prompting.standards = [
      {framework: 'csta2026', shortcode: 'MS-ALG-PS-05'},
    ];
    expect(() => parsePathwaySource(raw)).not.toThrow();
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

  it('flags an unknown ability id and a mismatched ability key', () => {
    const raw = served();
    raw.checkpoints[1].unlocks = ['aiBuilder', 'timeTravel'];
    raw.abilities.aiBuilder.id = 'builder';
    expect(problemsOf(raw)).toEqual([
      "abilities.aiBuilder: id 'builder' does not match key",
      "checkpoints.basics.unlocks: unknown ability 'timeTravel'",
    ]);
  });

  it('defaults abilities to an empty map', () => {
    const raw = served();
    delete raw.abilities;
    delete raw.checkpoints[1].unlocks;
    expect(parsePathway(raw).abilities).toEqual({});
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
      'checkpoints: requires must not form a cycle',
    ]);
  });

  it('flags a cycle that still has a root', () => {
    const raw = served();
    raw.checkpoints[1].requires = ['intro', 'style'];
    raw.checkpoints[2].requires = ['basics'];
    expect(problemsOf(raw)).toEqual([
      'checkpoints: requires must not form a cycle',
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
    raw.checkpoints[1].steps[0] = {
      ...raw.checkpoints[1].steps[0],
      lab: {type: 'weblab2', starterFiles: {'a.html': ''}},
    };
    expect(problemsOf(raw)).toEqual([
      expect.stringMatching(
        /^checkpoints\.basics\.steps\.build: project step cannot declare starterFiles/
      ),
    ]);
  });
});

describe('standards helpers', () => {
  it('referencedSkillIds lists skills once, in checkpoint order', () => {
    const raw = served();
    raw.checkpoints[2].skillIds = ['css', 'prompting'];
    expect(referencedSkillIds(parsePathway(raw))).toEqual(['prompting', 'css']);
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
