// The evidence level a student has shown in each skill, derived from their
// progress and the pathway's rubric fields. Nothing here is stored: the
// router reads evidence computed from progress on every decision, so authored
// evidence levels can change without migrating anything.

import {Answer, StepContext} from '../progress/model';
import {Measures} from '../schema/question';
import {Checkpoint, Pathway, QuestionsStep, Step} from '../types';

/** What made an observation: answered questions, with judges of student work to follow. */
type EvidenceSource = 'questions';

/** Where one observation of a skill came from. */
type EvidencePointer = {
  kind: 'question';
  stepId: string;
  questionId: number;
};

/** One thing a step showed about one skill. */
interface EvidenceObservation {
  skillId: string;
  evidenceLevel: number;
  source: EvidenceSource;
  from: EvidencePointer;
}

/** What has been shown about one skill. */
interface SkillEvidence {
  skillId: string;
  /** The highest evidence level the standing source showed; 0 is no evidence. */
  evidenceLevel: number;
  /** The strongest source that showed anything for this skill. */
  source: EvidenceSource;
  /** That source's observations at this evidence level. */
  from: EvidencePointer[];
}

/** All the evidence one pathway holds for a student, by skill id. A skill nothing has measured is absent. */
export type PathwayEvidence = {[skillId: string]: SkillEvidence};

/**
 * Sources from weakest to strongest. Where two show the same skill the
 * stronger one's evidence stands whatever its evidence level, since what a
 * student did outranks what they answered.
 */
const SOURCE_PRECEDENCE: EvidenceSource[] = ['questions'];

/** The default target for a skill a checkpoint lists but sets no target for. */
const DEFAULT_TARGET_EVIDENCE_LEVEL = 1;

/**
 * All the evidence the student's progress holds, by skill: every step's
 * observations, folded with `addObservation`.
 */
export function computeEvidence(
  pathway: Pathway,
  stepContextMap: {[stepId: string]: StepContext}
): PathwayEvidence {
  const evidence: PathwayEvidence = {};
  for (const checkpoint of pathway.checkpoints) {
    for (const step of checkpoint.steps) {
      const observations = getStepEvidence(step, stepContextMap[step.id]);
      for (const observation of observations) {
        addObservation(evidence, observation);
      }
    }
  }
  return evidence;
}

/**
 * Folds one observation into the evidence map. A stronger source replaces
 * what a weaker one showed; the same source keeps the higher evidence level,
 * with the pointers of every observation that showed it; a weaker source or
 * a lower evidence level changes nothing.
 */
function addObservation(
  evidence: PathwayEvidence,
  {skillId, evidenceLevel, source, from}: EvidenceObservation
): void {
  const prior = evidence[skillId];
  const rank = SOURCE_PRECEDENCE.indexOf(source);
  const priorRank = prior ? SOURCE_PRECEDENCE.indexOf(prior.source) : -1;
  const higher =
    !prior ||
    rank > priorRank ||
    (rank === priorRank && evidenceLevel > prior.evidenceLevel);
  if (higher) {
    evidence[skillId] = {skillId, evidenceLevel, source, from: [from]};
  } else if (rank === priorRank && evidenceLevel === prior.evidenceLevel) {
    evidence[skillId] = {...prior, from: [...prior.from, from]};
  }
}

/** What one step shows, given its context; empty for a step kind that shows nothing. */
function getStepEvidence(
  step: Step,
  context: StepContext | undefined
): EvidenceObservation[] {
  switch (step.kind) {
    case 'questions':
      return questionsStepEvidence(step, context);
    default:
      return [];
  }
}

/**
 * Observations from a questions step's measured questions. Each is read from
 * its first answer: a graded one shows its evidence level only when that
 * answer was right, since a student retries until correct; a survey one shows
 * the evidence level listed for the chosen choice.
 */
function questionsStepEvidence(
  step: QuestionsStep,
  context: StepContext | undefined
): EvidenceObservation[] {
  const observations: EvidenceObservation[] = [];
  for (const question of step.questions) {
    if (question.type !== 'MultipleChoiceQuestion' || !question.measures) {
      continue;
    }
    const evidenceLevel = measuredEvidenceLevel(
      question.measures,
      question.correctChoiceId,
      context?.answers?.[question.id]?.[0]
    );
    if (evidenceLevel === undefined) continue;
    observations.push({
      skillId: question.measures.skillId,
      evidenceLevel,
      source: 'questions',
      from: {kind: 'question', stepId: step.id, questionId: question.id},
    });
  }
  return observations;
}

/** The evidence level a checkpoint needs in one of its skills before it is demonstrated. */
function targetEvidenceLevel(checkpoint: Checkpoint, skillId: string): number {
  return (
    checkpoint.targetEvidenceLevels?.[skillId] ?? DEFAULT_TARGET_EVIDENCE_LEVEL
  );
}

/**
 * Whether evidence shows the student has already demonstrated a checkpoint:
 * every skill it develops is at or above its target. A checkpoint with no
 * skills is never demonstrated.
 */
export function isDemonstrated(
  checkpoint: Checkpoint,
  evidence: PathwayEvidence
): boolean {
  const skillIds = checkpoint.skillIds || [];
  return (
    skillIds.length > 0 &&
    skillIds.every(
      skillId =>
        (evidence[skillId]?.evidenceLevel ?? 0) >=
        targetEvidenceLevel(checkpoint, skillId)
    )
  );
}

/** The evidence level a question's first answer shows, or undefined when it shows nothing. */
function measuredEvidenceLevel(
  measures: Measures,
  correctChoiceId: string | undefined,
  first: Answer | undefined
): number | undefined {
  if (!first) return undefined;
  if ('evidenceLevel' in measures) {
    return first.answerId === correctChoiceId
      ? measures.evidenceLevel
      : undefined;
  }
  return measures.evidenceLevels[first.answerId];
}
