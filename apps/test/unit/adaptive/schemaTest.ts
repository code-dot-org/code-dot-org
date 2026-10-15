import {z} from 'zod';

import {
  AdaptiveContentError,
  checkpointsInProgressionOrder,
  parsePathway,
  parsePathwaySource,
  pathwaySchema,
  pathwaySourceSchema,
  pathwayStandards,
  findReferenceProblems,
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
              id: 1,
              type: 'MultipleChoiceQuestion',
              questionName: 'pick-one',
              questionTitle: 'Pick one',
              choices: [
                {id: 'a', text: 'A'},
                {id: 'b', text: 'B'},
              ],
              correctChoiceId: 'a',
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

const questionOf = (raw: Raw) => {
  const quiz = raw.checkpoints[0].steps[1];
  if (quiz.kind !== 'questions') throw new Error('fixture has no quiz');
  return quiz.questions[0];
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

  it('coerces string booleans in inlined level properties', () => {
    const raw = served();
    const build = raw.checkpoints[1].steps[0];
    if (build.kind !== 'level') throw new Error('fixture changed');
    Object.assign(build.levelProperties!, {hideShareAndRemix: 'false'});
    Object.assign(raw.project.levelProperties!, {hideShareAndRemix: 'true'});
    const pathway = parsePathway(raw);
    const step = pathway.checkpoints[1].steps[0];
    if (step.kind !== 'level') throw new Error('fixture changed');
    expect(step.levelProperties?.hideShareAndRemix).toBe(false);
    expect(pathway.project.levelProperties?.hideShareAndRemix).toBe(true);
  });

  it('rejects a key the quiz question summary lacks', () => {
    const raw = served();
    Object.assign(raw.checkpoints[0].steps[1], {
      questions: [{...questionOf(raw), multiSelect: true}],
    });
    expect(problemsOf(raw)).toHaveLength(1);
  });

  it('rejects a question page, as a step shows one question at a time', () => {
    const raw = served();
    Object.assign(raw.checkpoints[0].steps[1], {
      questions: [{...questionOf(raw), page: 2}],
    });
    expect(problemsOf(raw)).toHaveLength(1);
  });

  it('accepts a question with no correct choice', () => {
    const raw = served();
    const question = {...questionOf(raw)} as {correctChoiceId?: string};
    delete question.correctChoiceId;
    Object.assign(raw.checkpoints[0].steps[1], {questions: [question]});
    expect(problemsOf(raw)).toEqual([]);
  });

  it('rejects a quiz setting, as steps have no attempts', () => {
    const raw = served();
    Object.assign(raw.checkpoints[0].steps[1], {showCorrectness: true});
    expect(problemsOf(raw)).toHaveLength(1);
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

describe('findReferenceProblems', () => {
  it('finds nothing wrong with consistent content', () => {
    expect(findReferenceProblems(parsePathway(served()))).toEqual([]);
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

  it('flags a question id used in two steps, once', () => {
    const raw = served();
    const quiz = raw.checkpoints[0].steps[1];
    raw.checkpoints[2].steps = [
      {...quiz, id: 'quiz-2'},
      {...quiz, id: 'quiz-3'},
    ];
    expect(problemsOf(raw)).toEqual([
      "checkpoints: question id '1' is used more than once",
    ]);
  });

  it('flags a choice id used twice in one question, once', () => {
    const raw = served();
    Object.assign(questionOf(raw), {
      choices: [
        {id: 'a', text: 'A'},
        {id: 'b', text: 'B'},
        {id: 'b', text: 'C'},
        {id: 'b', text: 'D'},
      ],
    });
    expect(problemsOf(raw)).toEqual([
      "checkpoints.intro.steps.quiz.questions.0: choice id 'b' is used more than once",
    ]);
  });

  it('flags a correct choice that is not one of the choices', () => {
    const raw = served();
    Object.assign(questionOf(raw), {correctChoiceId: 'z'});
    expect(problemsOf(raw)).toEqual([
      "checkpoints.intro.steps.quiz.questions.0.correctChoiceId: 'z' is not one of its choices",
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

  it('flags a step that plays the project template level', () => {
    const raw = served();
    const build = raw.checkpoints[1].steps[0];
    if (build.kind !== 'level') throw new Error('fixture changed');
    build.level = 'web-template';
    build.levelProperties = levelProperties(1, 'web-template');
    expect(problemsOf(raw)).toEqual([
      "checkpoints.basics.steps.build: level 'web-template' is the project template level, which only the project view plays",
    ]);
  });

  it('flags a level played by two steps', () => {
    const raw = served();
    raw.checkpoints[2].steps = [
      {
        id: 'style-build',
        title: 'Build again',
        kind: 'level',
        level: 'web-project-basics',
        project: true,
        levelProperties: levelProperties(
          2,
          'web-project-basics',
          'web-template'
        ),
      },
    ];
    expect(problemsOf(raw)).toEqual([
      "checkpoints.style.steps.style-build: level 'web-project-basics' is already played by checkpoints.basics.steps.build",
    ]);
  });

  it('flags an instructions prompt on a sandbox step', () => {
    const raw = served();
    const practice = raw.checkpoints[1].steps[1];
    if (practice.kind !== 'level') throw new Error('fixture changed');
    practice.instructionsPrompt = 'Make it personal.';
    expect(problemsOf(raw)).toEqual([
      "checkpoints.basics.steps.practice: instructionsPrompt needs the student's project, so the step must be marked project",
    ]);
  });

  it('accepts an instructions prompt on a project step', () => {
    const raw = served();
    const build = raw.checkpoints[1].steps[0];
    if (build.kind !== 'level') throw new Error('fixture changed');
    build.instructionsPrompt = 'Make it personal.';
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

describe('evidence fields', () => {
  // A survey question beside the fixture's graded one, and levels on both skills.
  const withEvidence = (): Raw => {
    const raw = served();
    raw.skills.prompting.evidenceLevels = {
      1: 'Asks',
      2: 'Specifies',
      3: 'Judges',
    };
    raw.skills.css.evidenceLevels = {
      0: 'Has not styled yet',
      1: 'Spots a rule',
    };
    Object.assign(questionOf(raw), {
      measures: {skillId: 'prompting', evidenceLevel: 2},
    });
    const quiz = raw.checkpoints[0].steps[1];
    if (quiz.kind !== 'questions') throw new Error('fixture has no quiz');
    quiz.questions.push({
      id: 2,
      type: 'MultipleChoiceQuestion',
      questionName: 'self-check',
      questionTitle: 'Which sounds like you?',
      choices: [
        {id: 'a', text: 'New'},
        {id: 'b', text: 'Some'},
      ],
      measures: {skillId: 'prompting', evidenceLevels: {a: 0, b: 1}},
    });
    raw.checkpoints[1] = {
      ...raw.checkpoints[1],
      skippable: true,
      targetEvidenceLevels: {prompting: 2},
    };
    return raw;
  };
  const surveyOf = (raw: Raw) => {
    const quiz = raw.checkpoints[0].steps[1];
    if (quiz.kind !== 'questions') throw new Error('fixture has no quiz');
    return quiz.questions[1];
  };
  const where = 'checkpoints.intro.steps.quiz.questions';

  it('accepts a graded level, survey levels by choice, and a skippable target', () => {
    expect(problemsOf(withEvidence())).toEqual([]);
  });

  it('rejects a level of 0 where a level is a claim', () => {
    const raw = withEvidence();
    Object.assign(questionOf(raw), {
      measures: {skillId: 'prompting', evidenceLevel: 0},
    });
    expect(problemsOf(raw)).toHaveLength(1);
    const target = withEvidence();
    target.checkpoints[1].targetEvidenceLevels = {prompting: 0};
    expect(problemsOf(target)).toHaveLength(1);
  });

  it('flags measures naming an unknown skill', () => {
    const raw = withEvidence();
    Object.assign(questionOf(raw), {
      measures: {skillId: 'html', evidenceLevel: 1},
    });
    expect(problemsOf(raw)).toEqual([
      `${where}.0.measures: unknown skill 'html'`,
    ]);
  });

  it('flags one level on a survey question and levels by choice on a graded one', () => {
    const raw = withEvidence();
    Object.assign(questionOf(raw), {
      measures: {skillId: 'prompting', evidenceLevels: {a: 1}},
    });
    Object.assign(surveyOf(raw), {
      measures: {skillId: 'prompting', evidenceLevel: 1},
    });
    expect(problemsOf(raw)).toEqual([
      `${where}.0.measures: a question with a correctChoiceId measures one evidenceLevel, not evidenceLevels by choice`,
      `${where}.1.measures: evidenceLevel needs a correctChoiceId; a survey question lists evidenceLevels by choice`,
    ]);
  });

  it('flags a choice id that is not among the choices', () => {
    const raw = withEvidence();
    Object.assign(surveyOf(raw), {
      measures: {skillId: 'prompting', evidenceLevels: {a: 0, z: 1}},
    });
    expect(problemsOf(raw)).toEqual([
      `${where}.1.measures: 'z' is not one of its choices`,
    ]);
  });

  it('flags levels the skill does not describe', () => {
    const raw = withEvidence();
    Object.assign(questionOf(raw), {
      measures: {skillId: 'prompting', evidenceLevel: 4},
    });
    Object.assign(surveyOf(raw), {
      measures: {skillId: 'prompting', evidenceLevels: {a: 0, b: 5}},
    });
    raw.checkpoints[2] = {
      ...raw.checkpoints[2],
      skippable: true,
      targetEvidenceLevels: {css: 2},
    };
    expect(problemsOf(raw)).toEqual([
      `${where}.0.measures: skill 'prompting' describes no evidence level 4`,
      `${where}.1.measures.b: skill 'prompting' describes no evidence level 5`,
      "checkpoints.style.targetEvidenceLevels.css: skill 'css' describes no evidence level 2",
    ]);
  });

  it('rejects an evidence level key that is not a whole number', () => {
    const raw = withEvidence();
    raw.skills.css.evidenceLevels = {'1.5': 'Half', '-1': 'Less'};
    expect(problemsOf(raw)).toHaveLength(2);
  });

  it('does not bound levels for a skill with no described evidence levels', () => {
    const raw = withEvidence();
    delete raw.skills.prompting.evidenceLevels;
    Object.assign(questionOf(raw), {
      measures: {skillId: 'prompting', evidenceLevel: 9},
    });
    expect(problemsOf(raw)).toEqual([]);
  });

  it('flags a target for a skill the checkpoint does not develop', () => {
    const raw = withEvidence();
    raw.checkpoints[1].targetEvidenceLevels = {css: 1};
    expect(problemsOf(raw)).toEqual([
      "checkpoints.basics.targetEvidenceLevels: 'css' is not in skillIds",
    ]);
  });

  it('flags skippable on a checkpoint with no skills', () => {
    const raw = withEvidence();
    raw.checkpoints[0] = {...raw.checkpoints[0], skippable: true};
    expect(problemsOf(raw)).toEqual([
      'checkpoints.intro: skippable needs skillIds',
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
