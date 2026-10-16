import {StepContext} from '@cdo/apps/adaptive/progress';
import {
  PathwayEvidence,
  computeEvidence,
  isDemonstrated,
} from '@cdo/apps/adaptive/routing/evidence';
import {
  Checkpoint,
  MultipleChoiceDiagnosticQuestion,
  Pathway,
  QuestionsStep,
} from '@cdo/apps/adaptive/types';

const choices = [
  {id: 'a', text: 'A'},
  {id: 'b', text: 'B'},
  {id: 'c', text: 'C'},
];

const graded = (
  id: number,
  skillId: string,
  evidenceLevel: number
): MultipleChoiceDiagnosticQuestion => ({
  id,
  type: 'MultipleChoiceQuestion',
  questionName: `q${id}`,
  questionTitle: `Question ${id}`,
  choices,
  correctChoiceId: 'b',
  measures: {skillId, evidenceLevel},
});

const survey = (
  id: number,
  skillId: string,
  evidenceLevels: {[choiceId: string]: number}
): MultipleChoiceDiagnosticQuestion => ({
  id,
  type: 'MultipleChoiceQuestion',
  questionName: `q${id}`,
  questionTitle: `Question ${id}`,
  choices,
  measures: {skillId, evidenceLevels},
});

const unmeasured: MultipleChoiceDiagnosticQuestion = {
  id: 99,
  type: 'MultipleChoiceQuestion',
  questionName: 'self-check',
  questionTitle: 'Which sounds like you?',
  choices,
};

const questionsStep = (
  id: string,
  questions: QuestionsStep['questions']
): QuestionsStep => ({id, title: id, kind: 'questions', questions});

const panelsStep = (id: string): Checkpoint['steps'][number] => ({
  id,
  title: id,
  kind: 'panels',
  panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
});

const checkpoint = (
  id: string,
  steps: Checkpoint['steps'],
  rest: Partial<Checkpoint> = {}
): Checkpoint => ({id, title: id, description: id, steps, ...rest});

// Two skills: build measured by a survey and a graded question in the intro
// and by a later check; debug by one survey question. A panels step sits
// between, showing nothing.
const intro = questionsStep('intro-check', [
  unmeasured,
  survey(1, 'build', {a: 0, b: 1, c: 2}),
  graded(2, 'build', 2),
  survey(3, 'debug', {a: 0, b: 2}),
]);
const later = questionsStep('later-check', [graded(4, 'build', 3)]);
const pathway = {
  checkpoints: [
    checkpoint('intro', [panelsStep('welcome'), intro]),
    checkpoint('basics', [later], {
      skillIds: ['build'],
      requires: ['intro'],
      targetEvidenceLevels: {build: 2},
    }),
  ],
} as unknown as Pathway;

const answered = (entries: {
  [stepId: string]: {[questionId: number]: string[]};
}): {[stepId: string]: StepContext} =>
  Object.fromEntries(
    Object.entries(entries).map(([stepId, byQuestion]) => [
      stepId,
      {
        answers: Object.fromEntries(
          Object.entries(byQuestion).map(([questionId, picks]) => [
            questionId,
            picks.map(answerId => ({answerId})),
          ])
        ),
      },
    ])
  );

const question = (stepId: string, questionId: number) => ({
  kind: 'question',
  stepId,
  questionId,
});

describe('computeEvidence', () => {
  it('shows nothing with no answers', () => {
    expect(computeEvidence(pathway, {})).toEqual({});
  });

  it('reads a survey question from its answer and ignores an unmeasured one', () => {
    const evidence = computeEvidence(
      pathway,
      answered({'intro-check': {1: ['c'], 99: ['a']}})
    );
    expect(evidence).toEqual({
      build: {
        skillId: 'build',
        evidenceLevel: 2,
        source: 'questions',
        from: [question('intro-check', 1)],
      },
    });
  });

  it('reads a graded question from its first try, since retries continue until correct', () => {
    const rightFirst = computeEvidence(
      pathway,
      answered({'intro-check': {2: ['b']}})
    );
    expect(rightFirst.build.evidenceLevel).toBe(2);
    const rightEventually = computeEvidence(
      pathway,
      answered({'intro-check': {2: ['a', 'b']}})
    );
    expect(rightEventually).toEqual({});
  });

  it('takes the highest evidence level several questions show for one skill, citing only those that showed it', () => {
    const highest = computeEvidence(
      pathway,
      answered({
        'intro-check': {1: ['b'], 2: ['b']},
        'later-check': {4: ['b']},
      })
    );
    expect(highest.build.evidenceLevel).toBe(3);
    expect(highest.build.from).toEqual([question('later-check', 4)]);
    const tied = computeEvidence(
      pathway,
      answered({'intro-check': {1: ['c'], 2: ['b']}})
    );
    expect(tied.build.evidenceLevel).toBe(2);
    expect(tied.build.from).toEqual([
      question('intro-check', 1),
      question('intro-check', 2),
    ]);
  });

  it('lets a survey choice at 0 count as answered without lowering the skill', () => {
    const withCheck = computeEvidence(
      pathway,
      answered({'intro-check': {1: ['a'], 2: ['b']}})
    );
    expect(withCheck.build.evidenceLevel).toBe(2);
    expect(withCheck.build.from).toEqual([question('intro-check', 2)]);
    const alone = computeEvidence(
      pathway,
      answered({'intro-check': {1: ['a']}})
    );
    expect(alone.build.evidenceLevel).toBe(0);
  });

  it('ignores a survey choice with no listed evidence level', () => {
    expect(
      computeEvidence(pathway, answered({'intro-check': {3: ['c']}}))
    ).toEqual({});
  });

  it('keeps skills apart', () => {
    const evidence = computeEvidence(
      pathway,
      answered({'intro-check': {1: ['b'], 3: ['b']}})
    );
    expect(evidence.build.evidenceLevel).toBe(1);
    expect(evidence.debug.evidenceLevel).toBe(2);
  });
});

describe('isDemonstrated', () => {
  const evidenceAt = (build: number): PathwayEvidence => ({
    build: {
      skillId: 'build',
      evidenceLevel: build,
      source: 'questions',
      from: [],
    },
  });

  it('needs every skill at or above its target', () => {
    const basics = pathway.checkpoints[1];
    expect(isDemonstrated(basics, evidenceAt(2))).toBe(true);
    expect(isDemonstrated(basics, evidenceAt(1))).toBe(false);
    expect(isDemonstrated(basics, {})).toBe(false);
  });

  it('targets evidence level 1 for a skill with no target', () => {
    const untargeted = checkpoint('untargeted', [], {skillIds: ['build']});
    expect(isDemonstrated(untargeted, evidenceAt(1))).toBe(true);
    expect(isDemonstrated(untargeted, evidenceAt(0))).toBe(false);
  });

  it('treats a skill with no evidence as evidence level 0', () => {
    const both = checkpoint('both', [], {skillIds: ['build', 'debug']});
    expect(isDemonstrated(both, evidenceAt(3))).toBe(false);
  });

  it('is never true for a checkpoint with no skills', () => {
    expect(isDemonstrated(pathway.checkpoints[0], evidenceAt(3))).toBe(false);
  });
});
