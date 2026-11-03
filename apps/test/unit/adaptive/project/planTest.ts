import {Progress} from '@cdo/apps/adaptive/progress/model';
import {
  answersBySlot,
  checkpointPlan,
  planAnswers,
} from '@cdo/apps/adaptive/project/plan';
import {Pathway} from '@cdo/apps/adaptive/types';

const pathway: Pathway = {
  formatVersion: 4,
  id: 'p',
  title: 'Build a website',
  objective: 'Make a site.',
  project: {templateLevel: 'tmpl', description: 'A site.'},
  skills: {},
  checkpoints: [
    {
      id: 'intro',
      title: 'Intro',
      description: 'Start.',
      plan: {template: '{what} for {who}, {which}: {why}'},
      steps: [
        {
          id: 'plan',
          title: 'Plan',
          kind: 'questions',
          questions: [
            {
              id: 1,
              type: 'freeResponse',
              text: 'What will you make?',
              plan: 'what',
            },
            {
              id: 2,
              type: 'MultipleChoiceQuestion',
              questionName: 'q2',
              questionTitle: 'Pick one',
              choices: [
                {id: 'a', text: 'A'},
                {id: 'b', text: 'B'},
              ],
              allowOther: {},
              plan: 'which',
            },
            {id: 3, type: 'freeResponse', text: 'Who is it for?', plan: 'who'},
            {id: 5, type: 'freeResponse', text: 'Not in the plan'},
          ],
        },
        {
          id: 'branch',
          title: 'Branch',
          kind: 'questions',
          showIf: {stepId: 'plan', questionId: 2, choiceId: 'b'},
          questions: [
            {id: 6, type: 'freeResponse', text: 'Why B?', plan: 'why'},
          ],
        },
      ],
    },
    {
      id: 'later',
      title: 'Later',
      description: 'More.',
      plan: {template: '{more}'},
      steps: [
        {
          id: 'more',
          title: 'More',
          kind: 'questions',
          questions: [
            {id: 4, type: 'freeResponse', text: 'Anything else?', plan: 'more'},
          ],
        },
      ],
    },
  ],
};

const intro = pathway.checkpoints[0];

describe('planAnswers', () => {
  it('lists the latest answer to each plan question, typed or picked, in order, under its slot', () => {
    const progress: Progress = {
      steps: {
        more: {timeSpent: 0, answers: {4: [{answerId: 'x', text: 'No'}]}},
        plan: {
          timeSpent: 0,
          answers: {
            1: [
              {answerId: 'x', text: 'A cat site'},
              {answerId: 'y', text: 'A dog site'},
            ],
            2: [{answerId: 'a'}],
            3: [{answerId: 'x', text: '   '}],
            5: [{answerId: 'x', text: 'Left out'}],
          },
        },
      },
    };
    expect(planAnswers(intro, progress)).toEqual([
      {
        slot: 'what',
        question: 'What will you make?',
        answer: 'A dog site',
        typed: true,
      },
      {slot: 'which', question: 'Pick one', answer: 'A', typed: false},
    ]);
  });

  it('quotes a typed answer to a multiple choice question as typed', () => {
    const progress: Progress = {
      steps: {
        plan: {timeSpent: 0, answers: {2: [{answerId: 'other', text: 'C'}]}},
      },
    };
    expect(planAnswers(intro, progress)).toEqual([
      {slot: 'which', question: 'Pick one', answer: 'C', typed: true},
    ]);
  });

  it('leaves out a branch the current answers hide', () => {
    const branchAnswer = {6: [{answerId: '', text: 'Because'}]};
    const shown: Progress = {
      steps: {
        plan: {timeSpent: 0, answers: {2: [{answerId: 'b'}]}},
        branch: {timeSpent: 0, answers: branchAnswer},
      },
    };
    expect(planAnswers(intro, shown).map(a => a.answer)).toEqual([
      'B',
      'Because',
    ]);
    const hidden: Progress = {
      steps: {
        plan: {timeSpent: 0, answers: {2: [{answerId: 'b'}, {answerId: 'a'}]}},
        branch: {timeSpent: 0, answers: branchAnswer},
      },
    };
    expect(planAnswers(intro, hidden).map(a => a.answer)).toEqual(['A']);
  });

  it('is empty with nothing answered', () => {
    expect(planAnswers(intro, {steps: {}})).toEqual([]);
  });
});

describe('answersBySlot', () => {
  it('keys each answer by its slot, the first winning a slot filled twice', () => {
    expect(
      answersBySlot([
        {slot: 'what', question: 'q', answer: 'Dogs', typed: true},
        {slot: 'why', question: 'q', answer: 'Fun', typed: false},
        {slot: 'what', question: 'q', answer: 'Cats', typed: true},
      ])
    ).toEqual({what: 'Dogs', why: 'Fun'});
  });
});

describe('checkpointPlan', () => {
  it('fills the template once every slot has a visible answer', () => {
    const progress: Progress = {
      steps: {
        plan: {
          timeSpent: 0,
          answers: {
            1: [{answerId: '', text: 'A dog site'}],
            2: [{answerId: 'b'}],
            3: [{answerId: '', text: 'Me'}],
          },
        },
        branch: {timeSpent: 0, answers: {6: [{answerId: '', text: 'Fun'}]}},
      },
    };
    expect(checkpointPlan(intro, progress)).toEqual({
      answers: planAnswers(intro, progress),
      sentence: 'A dog site for Me, B: Fun',
    });
  });

  it('has no sentence while a slot is unanswered', () => {
    const progress: Progress = {
      steps: {plan: {timeSpent: 0, answers: {2: [{answerId: 'a'}]}}},
    };
    expect(checkpointPlan(intro, progress)).toEqual({
      answers: [
        {slot: 'which', question: 'Pick one', answer: 'A', typed: false},
      ],
      sentence: undefined,
    });
  });
});
