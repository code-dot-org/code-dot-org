import fs from 'fs';
import path from 'path';

import {normalizeLessonPlan} from '@cdo/apps/aiLessons/lessonFormat';
import {
  deterministicResolver,
  NavContext,
} from '@cdo/apps/aiLessons/navigation';
import {LessonPlan, Step} from '@cdo/apps/aiLessons/types';

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
  it('has no suggestion until student inputs exist', async () => {
    const question = (lesson.steps[1] as Extract<Step, {kind: 'questions'}>)
      .questions[1];
    expect(await deterministicResolver.recommend(ctx({}), question)).toBeNull();
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
