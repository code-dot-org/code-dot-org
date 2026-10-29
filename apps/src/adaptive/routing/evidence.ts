// The evidence level a student has shown in each skill, derived from their
// progress and the pathway's rubric fields. Nothing here is stored: the
// router reads evidence computed from progress on every decision, so authored
// evidence levels can change without migrating anything.

import type {Answer, Progress, StepProgress} from '../progress/model';
import {Measures} from '../schema/question';
import {Checkpoint, LevelStep, Pathway, QuestionsStep, Step} from '../types';

/** What made an observation: answered questions, or a check of the student's work on a project step. */
type EvidenceSource = 'questions' | 'validation';

/** Where one observation of a skill came from. */
type EvidencePointer = {kind: EvidenceSource; stepId: string} & (
  | {kind: 'questions'; questionId: number}
  | {kind: 'validation'; at: string}
);

/** One thing a step showed about one skill. */
interface EvidenceObservation {
  skillId: string;
  evidenceLevel: number;
  from: EvidencePointer;
}

/** What has been shown about one skill. */
interface SkillEvidence {
  skillId: string;
  /** The highest evidence level any observation showed; 0 is no evidence. */
  evidenceLevel: number;
  /** The observations at that evidence level, whatever made them. */
  from: EvidencePointer[];
}

/** All the evidence one pathway holds for a student, by skill id. A skill nothing has measured is absent. */
export type PathwayEvidence = {[skillId: string]: SkillEvidence};

/** The default target for a skill a checkpoint lists but sets no target for. */
const DEFAULT_TARGET_EVIDENCE_LEVEL = 1;

/**
 * All the evidence the student's progress holds, by skill: every step's
 * observations, folded with `addObservation`.
 */
export function computeEvidence(
  pathway: Pathway,
  progress: Progress
): PathwayEvidence {
  const evidence: PathwayEvidence = {};
  for (const checkpoint of pathway.checkpoints) {
    for (const step of checkpoint.steps) {
      for (const observation of getStepEvidence(
        step,
        progress.steps[step.id]
      )) {
        addObservation(evidence, observation);
      }
    }
  }
  return evidence;
}

/**
 * Folds one observation into the evidence map: the skill keeps its highest
 * evidence level, with the pointers of every observation that showed it.
 * Evidence never goes down, whatever made the lower observation.
 */
function addObservation(
  evidence: PathwayEvidence,
  {skillId, evidenceLevel, from}: EvidenceObservation
): void {
  const prior = evidence[skillId];
  if (!prior || evidenceLevel > prior.evidenceLevel) {
    evidence[skillId] = {skillId, evidenceLevel, from: [from]};
  } else if (evidenceLevel === prior.evidenceLevel) {
    evidence[skillId] = {...prior, from: [...prior.from, from]};
  }
}

/** What one step shows, given its progress; empty for a step kind that shows nothing. */
function getStepEvidence(
  step: Step,
  entry: StepProgress | undefined
): EvidenceObservation[] {
  switch (step.kind) {
    case 'questions':
      return questionsStepEvidence(step, entry);
    case 'level':
      return levelStepEvidence(step, entry);
    default:
      return [];
  }
}

/**
 * Observations from every check of a project step's work: each shows the
 * evidence level the judge rated the work at, in the skill the step
 * measures. A step with no validation block shows nothing.
 */
function levelStepEvidence(
  step: LevelStep,
  entry: StepProgress | undefined
): EvidenceObservation[] {
  const skillId = step.validation?.measures.skillId;
  if (!skillId) return [];
  return (entry?.validationHistory ?? []).map(attempt => ({
    skillId,
    evidenceLevel: attempt.evidenceLevel,
    from: {kind: 'validation', stepId: step.id, at: attempt.at},
  }));
}

/**
 * Observations from a questions step's measured questions. Each is read from
 * its first answer: a graded one shows its evidence level only when that
 * answer was right, since a student retries until correct; a survey one shows
 * the evidence level listed for the chosen choice.
 */
function questionsStepEvidence(
  step: QuestionsStep,
  entry: StepProgress | undefined
): EvidenceObservation[] {
  const observations: EvidenceObservation[] = [];
  for (const question of step.questions) {
    if (question.type !== 'MultipleChoiceQuestion' || !question.measures) {
      continue;
    }
    const evidenceLevel = measuredEvidenceLevel(
      question.measures,
      question.correctChoiceId,
      entry?.answers?.[question.id]?.[0]
    );
    if (evidenceLevel === undefined) continue;
    observations.push({
      skillId: question.measures.skillId,
      evidenceLevel,
      from: {kind: 'questions', stepId: step.id, questionId: question.id},
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
