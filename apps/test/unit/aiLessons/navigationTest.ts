import fs from 'fs';
import path from 'path';

import {normalizeLessonPlan} from '@cdo/apps/aiLessons/lessonFormat';
import {
  deterministicResolver,
  NavContext,
} from '@cdo/apps/aiLessons/navigation';
import {AnswerRecord, StudentInputs} from '@cdo/apps/aiLessons/studentInputs';
import {LessonPlan, Question, Step} from '@cdo/apps/aiLessons/types';

function lab(id: string, extra: Partial<Step> = {}): Step {
  return {
    id,
    kind: 'lab',
    title: id,
    labType: 'weblab2',
    description: '',
    validation: 'none',
    ...extra,
  } as Step;
}

// Mirrors the exemplars' shape: a check-in whose options branch, two
// practice spokes that rejoin, and a final free-play step.
const lesson: LessonPlan = {
  formatVersion: 2,
  title: 'Nav test',
  objective: '',
  authorInputs: {prompt: ''},
  steps: [
    lab('a'),
    {
      id: 'check-in',
      kind: 'questions',
      title: 'check-in',
      questions: [
        {
          id: 'q1',
          type: 'multipleChoice',
          prompt: 'no branch here',
          options: [{id: 'plain', label: 'plain'}],
        },
        {
          id: 'q2',
          type: 'multipleChoice',
          prompt: 'pick a path',
          options: [
            {id: 'to-spoke', label: 'spoke', goTo: 'spoke'},
            {id: 'to-final', label: 'final', goTo: 'final'},
            {id: 'dangling', label: 'bad', goTo: 'does-not-exist'},
          ],
        },
      ],
    },
    lab('spoke', {next: 'final'}),
    lab('skipped-by-spoke'),
    lab('final', {next: 'end'}),
    lab('unreachable'),
  ],
};

function ctx(overrides: Partial<NavContext>): NavContext {
  return {lesson, currentStepId: 'a', path: ['a'], ...overrides};
}

describe('deterministicResolver.resolveNext', () => {
  it('follows array order by default', async () => {
    expect(await deterministicResolver.resolveNext(ctx({}))).toEqual({
      kind: 'goto',
      stepId: 'check-in',
    });
  });

  it('follows a selected branch option over everything else', async () => {
    expect(
      await deterministicResolver.resolveNext(
        ctx({currentStepId: 'check-in', selectedOptionId: 'to-final'})
      )
    ).toEqual({kind: 'goto', stepId: 'final'});
  });

  it('ignores a selection without a branch target', async () => {
    expect(
      await deterministicResolver.resolveNext(
        ctx({currentStepId: 'check-in', selectedOptionId: 'plain'})
      )
    ).toEqual({kind: 'goto', stepId: 'spoke'});
  });

  it('falls through a dangling branch target to array order', async () => {
    expect(
      await deterministicResolver.resolveNext(
        ctx({currentStepId: 'check-in', selectedOptionId: 'dangling'})
      )
    ).toEqual({kind: 'goto', stepId: 'spoke'});
  });

  it('follows the step next pointer (branch rejoin)', async () => {
    expect(
      await deterministicResolver.resolveNext(ctx({currentStepId: 'spoke'}))
    ).toEqual({kind: 'goto', stepId: 'final'});
  });

  it('ends on next: end even with steps after it in the array', async () => {
    expect(
      await deterministicResolver.resolveNext(ctx({currentStepId: 'final'}))
    ).toEqual({kind: 'end'});
  });

  it('ends after the last array step', async () => {
    expect(
      await deterministicResolver.resolveNext(
        ctx({currentStepId: 'unreachable'})
      )
    ).toEqual({kind: 'end'});
  });

  it('ends when the current step id is unknown', async () => {
    expect(
      await deterministicResolver.resolveNext(ctx({currentStepId: 'nope'}))
    ).toEqual({kind: 'end'});
  });
});

describe('deterministicResolver.recommend', () => {
  const answer = (extra: Partial<AnswerRecord>): AnswerRecord => ({
    questionId: 'q',
    stepId: 's',
    prompt: 'p',
    answer: 'a',
    at: '2026-01-01T00:00:00Z',
    ...extra,
  });

  const hubQuestion: Question = {
    id: 'choice',
    type: 'multipleChoice',
    prompt: 'pick',
    options: [
      {
        id: 'html',
        label: 'HTML',
        recommendWhen: [
          {questionId: 'quiz', outcome: 'incorrect'},
          {questionId: 'quiz', minAttempts: 2},
        ],
      },
      {
        id: 'css',
        label: 'CSS',
        recommendWhen: [{questionId: 'experience', scaleAtMost: 4}],
      },
      {
        id: 'stay',
        label: 'Stay',
        recommendWhen: [{questionId: 'mood', answeredOptionId: 'confident'}],
      },
    ],
  };

  const recommendWith = (inputs: StudentInputs) =>
    deterministicResolver.recommend(ctx({inputs}), hubQuestion);

  it('has no suggestion without inputs or matching rules', async () => {
    const question = (lesson.steps[1] as Extract<Step, {kind: 'questions'}>)
      .questions[1];
    expect(await deterministicResolver.recommend(ctx({}), question)).toBeNull();
    expect(await recommendWith({})).toBeNull();
    // An answered question that satisfies no rule.
    expect(
      await recommendWith({
        quiz: answer({questionId: 'quiz', outcome: 'correct'}),
      })
    ).toBeNull();
  });

  it('matches graded outcomes and attempt counts', async () => {
    expect(
      await recommendWith({
        quiz: answer({questionId: 'quiz', outcome: 'incorrect'}),
      })
    ).toBe('html');
    // Struggled-then-correct: outcome is correct but attempts >= 2.
    expect(
      await recommendWith({
        quiz: answer({questionId: 'quiz', outcome: 'correct', attempts: 3}),
      })
    ).toBe('html');
  });

  it('matches scale bounds and chosen options', async () => {
    expect(
      await recommendWith({
        experience: answer({questionId: 'experience', value: 3}),
      })
    ).toBe('css');
    expect(
      await recommendWith({
        experience: answer({questionId: 'experience', value: 9}),
      })
    ).toBeNull();
    expect(
      await recommendWith({
        mood: answer({questionId: 'mood', optionId: 'confident'}),
      })
    ).toBe('stay');
  });

  it('prefers the first matching option in authored order', async () => {
    expect(
      await recommendWith({
        quiz: answer({questionId: 'quiz', outcome: 'incorrect'}),
        experience: answer({questionId: 'experience', value: 2}),
      })
    ).toBe('html');
  });
});

describe('automatic step branches', () => {
  const graded = (
    questionId: string,
    outcome: 'correct' | 'incorrect',
    attempts = 1
  ): AnswerRecord => ({
    questionId,
    stepId: 'quiz',
    prompt: 'p',
    answer: 'a',
    outcome,
    attempts,
    at: '2026-01-01T00:00:00Z',
  });

  const branchLesson: LessonPlan = {
    formatVersion: 2,
    title: 'Branch test',
    objective: '',
    authorInputs: {prompt: ''},
    steps: [
      {
        id: 'quiz',
        kind: 'questions',
        title: 'quiz',
        branches: [
          {
            when: {score: {questionsStepId: 'quiz', minFirstTryCorrect: 2}},
            goTo: 'fast',
          },
          {
            when: {score: {questionsStepId: 'quiz', maxFirstTryCorrect: 0}},
            goTo: 'remedial',
          },
        ],
        questions: [
          {
            id: 'k1',
            type: 'multipleChoice',
            prompt: '1',
            validation: 'key',
            options: [
              {id: 'opt', label: 'opt', correct: true},
              {id: 'escape', label: 'escape', goTo: 'rejoin'},
            ],
          },
          {id: 'k2', type: 'multipleChoice', prompt: '2', validation: 'key'},
        ],
      },
      lab('slow', {next: 'rejoin'}),
      lab('fast', {next: 'rejoin'}),
      lab('remedial', {next: 'rejoin'}),
      lab('rejoin'),
      lab('build', {
        branches: [
          {
            when: {aiJudge: {stepId: 'build', criteria: 'detailed'}},
            goTo: 'fast',
          },
        ],
      }),
      lab('dangler', {
        branches: [{when: {score: {questionsStepId: 'quiz'}}, goTo: 'nope'}],
      }),
    ],
  };

  const resolveFrom = (
    currentStepId: string,
    extra: Partial<NavContext> = {}
  ) =>
    deterministicResolver.resolveNext({
      lesson: branchLesson,
      currentStepId,
      path: [currentStepId],
      ...extra,
    });

  it('takes the first branch whose score condition holds', async () => {
    expect(
      await resolveFrom('quiz', {
        inputs: {k1: graded('k1', 'correct'), k2: graded('k2', 'correct')},
      })
    ).toEqual({kind: 'goto', stepId: 'fast'});
  });

  it('falls through to array order below the threshold', async () => {
    expect(
      await resolveFrom('quiz', {
        inputs: {k1: graded('k1', 'correct'), k2: graded('k2', 'incorrect')},
      })
    ).toEqual({kind: 'goto', stepId: 'slow'});
  });

  it('does not count retried-to-correct answers as first-try', async () => {
    expect(
      await resolveFrom('quiz', {
        inputs: {k1: graded('k1', 'correct'), k2: graded('k2', 'correct', 2)},
      })
    ).toEqual({kind: 'goto', stepId: 'slow'});
  });

  it('matches a maxFirstTryCorrect condition', async () => {
    expect(
      await resolveFrom('quiz', {
        inputs: {k1: graded('k1', 'incorrect'), k2: graded('k2', 'incorrect')},
      })
    ).toEqual({kind: 'goto', stepId: 'remedial'});
  });

  it('falls through with no inputs at all', async () => {
    expect(await resolveFrom('quiz')).toEqual({kind: 'goto', stepId: 'slow'});
  });

  it('lets a student-chosen branch option win over automatic branches', async () => {
    expect(
      await resolveFrom('quiz', {
        selectedOptionId: 'escape',
        inputs: {k1: graded('k1', 'correct'), k2: graded('k2', 'correct')},
      })
    ).toEqual({kind: 'goto', stepId: 'rejoin'});
  });

  it('skips a branch with a dangling target', async () => {
    expect(
      await resolveFrom('dangler', {inputs: {k1: graded('k1', 'correct')}})
    ).toEqual({kind: 'end'});
  });

  it('treats an aiJudge condition without a judge as no match', async () => {
    expect(await resolveFrom('build')).toEqual({
      kind: 'goto',
      stepId: 'dangler',
    });
  });

  it('routes on the injected judge verdict', async () => {
    expect(
      await resolveFrom('build', {judgeCondition: async () => true})
    ).toEqual({kind: 'goto', stepId: 'fast'});
    expect(
      await resolveFrom('build', {judgeCondition: async () => false})
    ).toEqual({kind: 'goto', stepId: 'dangler'});
  });

  it('treats a judge failure as no match', async () => {
    expect(
      await resolveFrom('build', {
        judgeCondition: async () => {
          throw new Error('gateway down');
        },
      })
    ).toEqual({kind: 'goto', stepId: 'dangler'});
  });
});

// Walk the real exemplar fixture: both multi-step mini-lessons must
// route back to the what-next branch point, and "work on my website"
// must lead to the end.  Guards the loop shape against content edits.
describe('musical-artist-webpage branch loop', () => {
  const fixture = normalizeLessonPlan(
    JSON.parse(
      fs.readFileSync(
        path.resolve(
          __dirname,
          '../../../../dashboard/config/ai_lessons/musical-artist-webpage.json'
        ),
        'utf-8'
      )
    )
  );

  // Follow resolver decisions from a step (optionally via a branch
  // option) until arriving back at a questions step or the end.
  async function walk(
    fromStepId: string,
    selectedOptionId?: string
  ): Promise<string[]> {
    const visited: string[] = [];
    let decision = await deterministicResolver.resolveNext({
      lesson: fixture,
      currentStepId: fromStepId,
      path: [fromStepId],
      selectedOptionId,
    });
    while (decision.kind === 'goto') {
      const stepId = decision.stepId;
      visited.push(stepId);
      const landed = fixture.steps.find(s => s.id === stepId);
      if (landed?.kind === 'questions' || visited.length > 20) break;
      decision = await deterministicResolver.resolveNext({
        lesson: fixture,
        currentStepId: stepId,
        path: visited,
      });
    }
    if (decision.kind === 'end') visited.push('end');
    return visited;
  }

  it('routes the HTML mini-lesson back to the branch point', async () => {
    expect(await walk('what-next', 'more-html')).toEqual([
      'html-extra-lists',
      'html-extra-headings',
      'what-next',
    ]);
  });

  it('routes the CSS mini-lesson back to the branch point', async () => {
    expect(await walk('what-next', 'more-css')).toEqual([
      'css-extra-fonts',
      'css-extra-boxes',
      'what-next',
    ]);
  });

  it('routes "work on my website" to free play and the end', async () => {
    expect(await walk('what-next', 'stay')).toEqual(['free-play', 'end']);
  });
});

// Walk the website-with-ai fixture's two branch points: the quiz score
// splits into accelerated/foundational layout paths that rejoin, and the
// AI-judged prompt-quality split routes polish vs. prompt-upgrading.
describe('website-with-ai branch points', () => {
  const fixture = normalizeLessonPlan(
    JSON.parse(
      fs.readFileSync(
        path.resolve(
          __dirname,
          '../../../../dashboard/config/ai_lessons/website-with-ai.json'
        ),
        'utf-8'
      )
    )
  );

  const quizAnswers = (firstTryCorrect: number): StudentInputs => {
    const ids = ['q-footer', 'q-header', 'q-nav', 'q-hero', 'q-cards'];
    const inputs: StudentInputs = {};
    ids.forEach((id, i) => {
      inputs[id] = {
        questionId: id,
        stepId: 'webpage-parts-quiz',
        prompt: 'p',
        answer: 'a',
        outcome: 'correct',
        // Gated quiz: everyone ends correct; below the cut they retried.
        attempts: i < firstTryCorrect ? 1 : 2,
        at: '2026-01-01T00:00:00Z',
      };
    });
    return inputs;
  };

  async function walk(
    fromStepId: string,
    extra: Partial<NavContext> = {},
    stopAt?: string
  ): Promise<string[]> {
    const visited: string[] = [];
    let current = fromStepId;
    for (let hops = 0; hops < 20; hops++) {
      const decision = await deterministicResolver.resolveNext({
        lesson: fixture,
        currentStepId: current,
        path: [...visited, current],
        ...extra,
      });
      if (decision.kind === 'end') {
        visited.push('end');
        break;
      }
      visited.push(decision.stepId);
      if (decision.stepId === stopAt) break;
      current = decision.stepId;
    }
    return visited;
  }

  it('routes a 5/5 first-try quiz to the accelerated layout path', async () => {
    expect(
      await walk(
        'webpage-parts-quiz',
        {inputs: quizAnswers(5)},
        'great-improvements'
      )
    ).toEqual(['layout-prompt', 'great-improvements']);
  });

  it('routes exactly 4/5 to the accelerated path', async () => {
    expect(
      await walk(
        'webpage-parts-quiz',
        {inputs: quizAnswers(4)},
        'great-improvements'
      )
    ).toEqual(['layout-prompt', 'great-improvements']);
  });

  it('routes 3/5 to the foundational layout fix, rejoining after', async () => {
    expect(
      await walk(
        'webpage-parts-quiz',
        {inputs: quizAnswers(3)},
        'great-improvements'
      )
    ).toEqual(['fix-layout', 'great-improvements']);
  });

  it('routes a detailed ui-shell prompt to polish & motion', async () => {
    expect(await walk('ui-shell', {judgeCondition: async () => true})).toEqual([
      'polish-motion',
      'finalize',
      'end',
    ]);
  });

  it('routes a vague ui-shell prompt to prompt upgrading', async () => {
    expect(await walk('ui-shell', {judgeCondition: async () => false})).toEqual(
      ['upgrade-prompts', 'finalize', 'end']
    );
  });
});
