import {
  AdaptiveContentError,
  parsePathway,
  parsePathwaySource,
  parseSkillSource,
  pathwayStandards,
  referenceProblems,
  referencedSkillIds,
} from '@cdo/apps/adaptive/schema';
import {Pathway} from '@cdo/apps/adaptive/types';

type LabType = Pathway['project']['lab']['type'];

const skill = {
  id: 'prompting',
  title: 'Prompting',
  description: 'Write structural prompts.',
  checkpoints: [
    {
      id: 'basics',
      title: 'Basics',
      description: 'What a prompt is.',
      steps: [
        {
          id: 'intro',
          kind: 'panels',
          title: 'Intro',
          panels: [{caption: 'hi'}],
        },
        {
          id: 'layout',
          kind: 'lab',
          title: 'Layout',
          lab: {type: 'weblab2', initialViewMode: 'preview'},
          sourceMode: 'practice',
          instructions: 'Do it.',
          validation: {successCriteria: 'Three sections.'},
        },
      ],
    },
    {
      id: 'precision',
      title: 'Precision',
      description: 'Name the element and the change.',
      requires: ['basics'],
      steps: [
        {
          id: 'refine',
          kind: 'lab',
          title: 'Refine',
          lab: {type: 'weblab2'},
          instructions: 'Do it better.',
        },
      ],
    },
  ],
};

const content = {
  formatVersion: 3,
  id: 'sample',
  title: 'Sample',
  objective: 'Build a site.',
  project: {lab: {type: 'weblab2'}, description: 'A site.'},
  steps: [
    {
      id: 'welcome',
      kind: 'panels',
      title: 'Welcome',
      panels: [{caption: 'hi'}],
    },
    {
      id: 'diagnostic',
      kind: 'questions',
      title: 'Diagnostic',
      questions: [
        {
          id: 'q1',
          type: 'multipleChoice',
          prompt: 'Pick',
          options: [
            {id: 'a', label: 'A', correct: true},
            {id: 'b', label: 'B'},
          ],
        },
        {id: 'q2', type: 'freeResponse', prompt: 'Say'},
      ],
    },
    {
      id: 'tree',
      kind: 'skillTree',
      title: 'Tree',
      skills: [{skillId: 'prompting', requiredCheckpointId: 'basics'}],
    },
    {
      id: 'build',
      kind: 'lab',
      title: 'Build',
      lab: {type: 'weblab2'},
      instructions: 'Build it.',
      next: 'end',
    },
  ],
  skills: {prompting: skill},
};

const source = Object.fromEntries(
  Object.entries(content).filter(([key]) => key !== 'skills')
);

function problemsOf(raw: unknown): string[] {
  try {
    parsePathway(raw);
  } catch (e) {
    if (e instanceof AdaptiveContentError) return e.problems;
    throw e;
  }
  return [];
}

function withSkill(patch: object) {
  return {...content, skills: {prompting: {...skill, ...patch}}};
}

describe('parsePathway', () => {
  it('accepts valid content and fills defaults', () => {
    const parsed = parsePathway(content);
    const tree = parsed.steps.find(s => s.id === 'tree');
    expect(tree?.kind === 'skillTree' && tree.skills[0]).toEqual({
      skillId: 'prompting',
      requiredCheckpointId: 'basics',
      required: true,
    });
    const build = parsed.steps.find(s => s.id === 'build');
    expect(build?.kind === 'lab' && build.sourceMode).toBe('project');
    expect(build?.kind === 'lab' && build.validation).toBeUndefined();
    const layout = parsed.skills.prompting.checkpoints[0].steps[1];
    expect(layout.kind === 'lab' && layout.validation).toEqual({
      successCriteria: 'Three sections.',
    });
  });

  it('reports the path of a schema violation', () => {
    const bad = {...content, steps: [{...content.steps[0], panels: []}]};
    expect(problemsOf(bad)).toEqual([
      expect.stringMatching(/^steps\.0\.panels:/),
    ]);
  });

  it('rejects an unknown format version', () => {
    expect(problemsOf({...content, formatVersion: 2})).toEqual([
      expect.stringMatching(/^formatVersion:/),
    ]);
  });

  it('rejects a validation block without criteria', () => {
    const bad = {
      ...content,
      steps: content.steps.map(s =>
        s.id === 'build' ? {...s, validation: {}} : s
      ),
    };
    expect(problemsOf(bad)).toEqual([
      expect.stringMatching(/^steps\.3\.validation\.successCriteria:/),
    ]);
  });

  it('rejects lab configuration outside the closed list', () => {
    const withLab = (lab: unknown) => ({
      ...content,
      steps: content.steps.map(s => (s.id === 'build' ? {...s, lab} : s)),
    });
    expect(problemsOf(withLab({type: 'weblab2', instructions: 'no'}))).toEqual([
      expect.stringMatching(/^steps\.3\.lab: Unrecognized key/),
    ]);
    expect(problemsOf(withLab({type: 'music'}))).toEqual([
      expect.stringMatching(/^steps\.3\.lab\.type:/),
    ]);
  });

  it('rejects an unknown key anywhere, so a misspelled field cannot vanish', () => {
    const bad = {
      ...content,
      steps: content.steps.map(s =>
        s.id === 'build' ? {...s, sucessCriteria: 'typo'} : s
      ),
    };
    expect(problemsOf(bad)).toEqual([
      expect.stringMatching(/^steps\.3: Unrecognized key/),
    ]);
  });

  it('rejects routing and skill trees inside a skill', () => {
    const routed = {
      ...skill,
      checkpoints: [
        {
          ...skill.checkpoints[0],
          steps: [{...skill.checkpoints[0].steps[0], next: 'layout'}],
        },
      ],
    };
    expect(() => parseSkillSource(routed)).toThrow(/Unrecognized key/);
    const treed = {
      ...skill,
      checkpoints: [
        {
          ...skill.checkpoints[0],
          steps: [
            {
              id: 't',
              kind: 'skillTree',
              title: 'T',
              skills: [{skillId: 'x', requiredCheckpointId: 'y'}],
            },
          ],
        },
      ],
    };
    expect(() => parseSkillSource(treed)).toThrow(AdaptiveContentError);
  });
});

describe('standards', () => {
  const ref = {framework: 'csta2026', shortcode: 'MS-PRO-RD-18'};
  const resolved = {
    ...ref,
    frameworkName: 'CSTA K-12 Computer Science Standards (2026)',
    description: 'Analyze AI-generated code for accuracy and usability.',
    categoryShortcode: 'RD',
    categoryDescription: 'Reading and Discussing Code',
    parentCategoryShortcode: 'PRO',
    parentCategoryDescription: 'Programming',
  };

  it('a pathway source has no standards of its own', () => {
    expect(() => parsePathwaySource({...source, standards: [ref]})).toThrow(
      /Unrecognized key/
    );
  });

  it('skill sources carry bare references', () => {
    expect(parseSkillSource({...skill, standards: [ref]}).standards).toEqual([
      ref,
    ]);
  });

  it('a served skill carries resolved standards', () => {
    const served = parsePathway({
      ...content,
      skills: {prompting: {...skill, standards: [resolved]}},
    });
    expect(served.skills.prompting.standards?.[0].description).toBe(
      resolved.description
    );
  });

  it('a served skill rejects an unresolved reference', () => {
    expect(
      problemsOf({
        ...content,
        skills: {prompting: {...skill, standards: [ref]}},
      })
    ).toEqual([
      expect.stringMatching(/^skills\.prompting\.standards\.0\.frameworkName:/),
      expect.stringMatching(/^skills\.prompting\.standards\.0\.description:/),
    ]);
  });

  it("pathwayStandards unions the skills' standards without duplicates, in skill order", () => {
    const other = {
      ...resolved,
      shortcode: 'MS-ALG-PS-05',
      description: 'Use an AI tool.',
    };
    const debugging = {...skill, id: 'debugging', standards: [other, resolved]};
    const served = parsePathway({
      ...content,
      steps: content.steps.map(s =>
        s.id === 'tree'
          ? {
              ...s,
              skills: [
                {skillId: 'prompting', requiredCheckpointId: 'basics'},
                {skillId: 'debugging', requiredCheckpointId: 'basics'},
              ],
            }
          : s
      ),
      skills: {prompting: {...skill, standards: [resolved]}, debugging},
    });
    expect(pathwayStandards(served).map(s => s.shortcode)).toEqual([
      'MS-PRO-RD-18',
      'MS-ALG-PS-05',
    ]);
  });
});

describe('parsePathwaySource', () => {
  it('accepts an authored file without skills', () => {
    expect(parsePathwaySource(source).id).toBe('sample');
  });

  it('rejects a served payload, since skills are inlined by the server', () => {
    expect(() => parsePathwaySource(content)).toThrow(/Unrecognized key/);
  });

  it('does not check references, which need the inlined skills', () => {
    const dangling = {
      ...source,
      steps: [{...content.steps[0], next: 'nowhere'}],
    };
    expect(() => parsePathwaySource(dangling)).not.toThrow();
    expect(problemsOf({...dangling, skills: {}})).toContain(
      "steps.welcome.next: unknown step 'nowhere'"
    );
  });
});

describe('referenceProblems', () => {
  const parsed = (): Pathway => parsePathway(content);

  it('finds nothing wrong with consistent content', () => {
    expect(referenceProblems(parsed())).toEqual([]);
  });

  it('flags next pointing at an unknown pathway step', () => {
    const c = parsed();
    c.steps[0].next = 'nowhere';
    expect(referenceProblems(c)).toEqual([
      "steps.welcome.next: unknown step 'nowhere'",
    ]);
  });

  it('flags a skill tree referencing a skill that was not inlined', () => {
    const c = parsed();
    c.skills = {};
    expect(referenceProblems(c)).toEqual([
      "steps.tree.skills: unknown skill 'prompting'",
    ]);
  });

  it('flags a skill tree gating on a checkpoint the skill does not have', () => {
    const c = parsed();
    const tree = c.steps[2];
    if (tree.kind === 'skillTree')
      tree.skills[0].requiredCheckpointId = 'mastery';
    expect(referenceProblems(c)).toEqual([
      "steps.tree.skills: skill 'prompting' has no checkpoint 'mastery'",
    ]);
  });

  it('flags a project-mode step whose lab differs from the project, in a skill or the pathway', () => {
    const c = parsed();
    // Only one lab type exists today, so a mismatch has to be forced.
    c.project.lab.type = 'music' as LabType;
    const refine = c.skills.prompting.checkpoints[1].steps[0];
    if (refine.kind === 'lab') refine.sourceMode = 'project';
    expect(referenceProblems(c)).toEqual([
      "steps.build: project step uses 'weblab2' but the pathway's project is 'music'",
      "skills.prompting.checkpoints.precision.steps.refine: project step uses 'weblab2' but the pathway's project is 'music'",
    ]);
  });

  it('ignores lab type on practice steps', () => {
    const c = parsed();
    c.project.lab.type = 'music' as LabType;
    c.steps = c.steps.filter(s => s.id !== 'build');
    const refine = c.skills.prompting.checkpoints[1].steps[0];
    if (refine.kind === 'lab') refine.sourceMode = 'practice';
    expect(referenceProblems(c)).toEqual([]);
  });

  it('flags starter files on a project-mode step', () => {
    const c = parsed();
    const build = c.steps[3];
    if (build.kind === 'lab')
      build.lab = {type: 'weblab2', starterFiles: {'index.html': ''}};
    expect(referenceProblems(c)).toEqual([
      'steps.build: project step cannot declare starterFiles; the project already has sources',
    ]);
  });

  it('flags a skill key that does not match the file id', () => {
    const c = parsed();
    c.steps = c.steps.filter(s => s.kind !== 'skillTree');
    c.skills = {renamed: c.skills.prompting};
    expect(referenceProblems(c)).toEqual([
      "skills.renamed: file id 'prompting' does not match key",
    ]);
  });

  it('flags duplicate step ids in the pathway and across a skill', () => {
    const c = parsed();
    c.steps[1].id = 'welcome';
    c.skills.prompting.checkpoints[1].steps[0].id = 'intro';
    expect(referenceProblems(c)).toEqual([
      'steps: ids must be unique',
      'skills.prompting: step ids must be unique across checkpoints',
    ]);
  });

  describe('checkpoint graph', () => {
    const [basics, precision] = skill.checkpoints;

    it('flags a requires naming an unknown checkpoint', () => {
      expect(
        problemsOf(
          withSkill({
            checkpoints: [basics, {...precision, requires: ['ghost']}],
          })
        )
      ).toEqual([
        "skills.prompting.checkpoints.precision.requires: unknown checkpoint 'ghost'",
      ]);
    });

    it('flags a skill with no entry point', () => {
      expect(
        problemsOf(
          withSkill({
            checkpoints: [{...basics, requires: ['precision']}, precision],
          })
        )
      ).toEqual([
        'skills.prompting.checkpoints: no entry point (every checkpoint has requires)',
        'skills.prompting.checkpoints: requires must not form a cycle',
      ]);
    });

    it('flags a cycle that still has an entry point', () => {
      const advanced = {
        ...precision,
        id: 'advanced',
        requires: ['expert'],
        steps: [{...precision.steps[0], id: 'a1'}],
      };
      const expert = {
        ...precision,
        id: 'expert',
        requires: ['advanced'],
        steps: [{...precision.steps[0], id: 'e1'}],
      };
      expect(
        problemsOf(
          withSkill({checkpoints: [basics, precision, advanced, expert]})
        )
      ).toEqual([
        'skills.prompting.checkpoints: requires must not form a cycle',
      ]);
    });

    it('flags duplicate checkpoint ids', () => {
      const dup = {...basics, steps: [{...basics.steps[0], id: 'dup1'}]};
      expect(problemsOf(withSkill({checkpoints: [basics, dup]}))).toEqual([
        'skills.prompting.checkpoints: ids must be unique',
      ]);
    });

    it('accepts parallel checkpoints that share a prerequisite', () => {
      const alt = {
        ...precision,
        id: 'alt',
        steps: [{...precision.steps[0], id: 'alt1'}],
      };
      expect(
        problemsOf(withSkill({checkpoints: [basics, precision, alt]}))
      ).toEqual([]);
    });
  });
});

describe('referencedSkillIds', () => {
  it('lists skill tree skills once, in order', () => {
    const c = parsePathway(content);
    c.steps.push({
      id: 'tree2',
      kind: 'skillTree',
      title: 'T2',
      skills: [
        {skillId: 'debugging', requiredCheckpointId: 'x', required: true},
        {skillId: 'prompting', requiredCheckpointId: 'basics', required: true},
      ],
    });
    expect(referencedSkillIds(c.steps)).toEqual(['prompting', 'debugging']);
  });
});
