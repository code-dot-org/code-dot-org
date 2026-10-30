// The student's plan for their project, read out of their answers to the
// plan questions of a checkpoint: what the review shows and the build is
// briefed with.

import {Progress, visibleSteps} from '../progress/model';
import {fillPlanTemplate} from '../schema/planTemplate';
import {OTHER_CHOICE_ID} from '../schema/question';
import {Checkpoint} from '../types';

export interface AnsweredQuestion {
  /** The plan slot the answer fills. */
  slot: string;
  question: string;
  answer: string;
  /** Whether the student typed the answer, rather than picking it. */
  typed: boolean;
}

/**
 * The latest answer to every plan question in a checkpoint, in order, under
 * its question and slot. Steps the student's answers hide are left out.
 */
export function planAnswers(
  checkpoint: Checkpoint,
  progress: Progress
): AnsweredQuestion[] {
  const answered: AnsweredQuestion[] = [];
  for (const step of visibleSteps(checkpoint, progress)) {
    if (step.kind !== 'questions') continue;
    const answers = progress.steps[step.id]?.answers;
    if (!answers) continue;
    for (const question of step.questions) {
      const slot = question.plan;
      if (!slot) continue;
      const latest = answers[question.id]?.at(-1);
      if (!latest) continue;
      if (question.type === 'freeResponse') {
        const text = latest.text?.trim();
        if (text) {
          answered.push({
            slot,
            question: question.text,
            answer: text,
            typed: true,
          });
        }
      } else if (latest.answerId === OTHER_CHOICE_ID) {
        const text = latest.text?.trim();
        if (text) {
          answered.push({
            slot,
            question: question.questionTitle,
            answer: text,
            typed: true,
          });
        }
      } else {
        const choice = question.choices.find(c => c.id === latest.answerId);
        if (choice) {
          answered.push({
            slot,
            question: question.questionTitle,
            answer: choice.text,
            typed: false,
          });
        }
      }
    }
  }
  return answered;
}

/** Each slot's answer; the first wins where two questions fill one slot. */
export function answersBySlot(answers: readonly AnsweredQuestion[]): {
  [slot: string]: string;
} {
  const bySlot: {[slot: string]: string} = {};
  for (const {slot, answer} of answers) {
    if (!(slot in bySlot)) bySlot[slot] = answer;
  }
  return bySlot;
}

/** A checkpoint's plan as it stands: what every surface that quotes it reads. */
export interface CheckpointPlan {
  answers: AnsweredQuestion[];
  /** The template filled from the answers; absent until every slot has one. */
  sentence?: string;
}

/** The plan from the checkpoint's visible plan answers. */
export function checkpointPlan(
  checkpoint: Checkpoint,
  progress: Progress
): CheckpointPlan {
  const answers = planAnswers(checkpoint, progress);
  const sentence = checkpoint.plan
    ? fillPlanTemplate(checkpoint.plan.template, answersBySlot(answers))
    : undefined;
  return {answers, sentence};
}
