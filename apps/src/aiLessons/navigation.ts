// Navigation resolver for AI Lessons.
//
// StudentPage never computes "index + 1" itself: when a step completes it
// asks the resolver where to go.  The interface is async and takes the
// full lesson context so an AI-backed resolver (suggest a next step from
// the student's answers, performance, and chat) can slot in later without
// touching any call site.  The deterministic resolver below is the whole
// story for now: branch option wins, then the step's `next` pointer, then
// array order, then end.

import {StudentInputs} from './studentInputs';
import {
  BranchCondition,
  hubOwning,
  LessonPlan,
  pathStepsFor,
  Question,
  QuestionsStep,
  RecommendRule,
  Step,
} from './types';

export interface NavContext {
  lesson: LessonPlan;
  currentStepId: string;
  // Step ids visited so far, in order, ending with the current step.
  path: string[];
  // Set when the step completed via a multiple-choice selection whose
  // option may carry a branch target.
  selectedOptionId?: string;
  // The student's recorded answers; what recommend() rules and branch
  // score conditions match against.
  inputs?: StudentInputs;
  // Step ids the student has completed (the current step included, when
  // resolving its completion).  Drives skill-path continuation.
  completedStepIds?: string[];
  // Evaluates a branch's aiJudge condition (an LLM call, so injected by
  // the page rather than imported here — navigation stays pure and
  // testable).  Absent, or on judge failure, the condition doesn't
  // match and the step falls through to its default path.
  judgeCondition?: (
    aiJudge: NonNullable<BranchCondition['aiJudge']>,
    ctx: NavContext
  ) => Promise<boolean>;
}

export type NavDecision = {kind: 'goto'; stepId: string} | {kind: 'end'};

export interface NavigationResolver {
  resolveNext(ctx: NavContext): Promise<NavDecision>;
  // Which option of a multiple-choice question to highlight as the
  // suggested path (a hub's "one choice is suggested but all are
  // available").  Null means no suggestion.  The deterministic resolver
  // matches authored `recommendWhen` rules against the student's
  // recorded answers; an AI resolver can later weigh anything in ctx.
  recommend(ctx: NavContext, question: Question): Promise<string | null>;
}

function findStepIndex(lesson: LessonPlan, stepId: string): number {
  return lesson.steps.findIndex(s => s.id === stepId);
}

function stepExists(lesson: LessonPlan, stepId: string): boolean {
  return findStepIndex(lesson, stepId) >= 0;
}

// The branch target of the selected option, if the current step is a
// questions step and the option carries one.
function selectedBranchTarget(
  step: Step,
  selectedOptionId: string | undefined
): string | undefined {
  if (!selectedOptionId || step.kind !== 'questions') return undefined;
  for (const question of (step as QuestionsStep).questions) {
    const option = (question.options || []).find(
      o => o.id === selectedOptionId
    );
    if (option?.goTo) return option.goTo;
  }
  return undefined;
}

export const deterministicResolver: NavigationResolver = {
  async resolveNext(ctx: NavContext): Promise<NavDecision> {
    const {lesson, currentStepId, selectedOptionId} = ctx;
    const index = findStepIndex(lesson, currentStepId);
    const step = index >= 0 ? lesson.steps[index] : undefined;

    // 1. A branch option chosen by the student wins.  A target that
    // doesn't resolve (hand-edited JSON drift) falls through rather
    // than dead-ending the lesson.
    if (step) {
      const branchTarget = selectedBranchTarget(step, selectedOptionId);
      if (branchTarget && stepExists(lesson, branchTarget)) {
        return {kind: 'goto', stepId: branchTarget};
      }

      // 2. Automatic branches: the first condition that holds against
      // the student's record wins.  A condition that can't be evaluated
      // (unanswered questions, missing judge, judge failure) doesn't
      // match, so the fallthrough path below is the default branch.
      for (const branch of step.branches || []) {
        if (!stepExists(lesson, branch.goTo)) continue;
        if (await branchConditionHolds(branch.when, ctx)) {
          return {kind: 'goto', stepId: branch.goTo};
        }
      }

      // 3. Skill-path continuation: a step owned by a hub path flows to
      // the path's next incomplete step, and back to its hub once none
      // remain.  Ranked below `branches` so remediation spurs inside a
      // path still fire, above `next` so path steps never need authored
      // pointers.
      const owner = hubOwning(lesson, currentStepId);
      if (owner) {
        const completed = ctx.completedStepIds || [];
        const nextInPath = pathStepsFor(lesson, owner.path).find(
          id => id !== currentStepId && !completed.includes(id)
        );
        return {kind: 'goto', stepId: nextInPath || owner.hub.id};
      }

      // 4. The step's own `next` pointer (branch rejoins, early ends).
      if (step.next === 'end') return {kind: 'end'};
      if (step.next && stepExists(lesson, step.next)) {
        return {kind: 'goto', stepId: step.next};
      }
    }

    // 5. Array order.
    if (index >= 0 && index < lesson.steps.length - 1) {
      return {kind: 'goto', stepId: lesson.steps[index + 1].id};
    }
    return {kind: 'end'};
  },

  async recommend(ctx: NavContext, question: Question): Promise<string | null> {
    const inputs = ctx.inputs;
    if (!inputs) return null;
    for (const option of question.options || []) {
      if (
        (option.recommendWhen || []).some(rule => ruleMatches(rule, inputs))
      ) {
        return option.id;
      }
    }
    return null;
  },
};

async function branchConditionHolds(
  when: BranchCondition,
  ctx: NavContext
): Promise<boolean> {
  if (when.score) return scoreConditionHolds(when.score, ctx);
  if (when.aiJudge && ctx.judgeCondition) {
    try {
      return await ctx.judgeCondition(when.aiJudge, ctx);
    } catch (e) {
      console.warn('AI judge branch condition failed', e);
      return false;
    }
  }
  return false;
}

// Counts answers to the referenced questions step that were correct on
// the first attempt.  Retries still gate the quiz UI; only first tries
// score, so a gated quiz can still discriminate.
function scoreConditionHolds(
  score: NonNullable<BranchCondition['score']>,
  ctx: NavContext
): boolean {
  const step = ctx.lesson.steps.find(s => s.id === score.questionsStepId);
  if (!step || step.kind !== 'questions' || !ctx.inputs) return false;
  const inputs = ctx.inputs;
  const firstTryCorrect = (step as QuestionsStep).questions.filter(q => {
    const record = inputs[q.id];
    return (
      record?.outcome === 'correct' &&
      (record.attempts === undefined || record.attempts <= 1)
    );
  }).length;
  if (
    score.minFirstTryCorrect !== undefined &&
    firstTryCorrect < score.minFirstTryCorrect
  ) {
    return false;
  }
  if (
    score.maxFirstTryCorrect !== undefined &&
    firstTryCorrect > score.maxFirstTryCorrect
  ) {
    return false;
  }
  return true;
}

// Every field present in the rule must hold against the referenced
// answer; an unanswered question matches nothing.
function ruleMatches(rule: RecommendRule, inputs: StudentInputs): boolean {
  const record = inputs[rule.questionId];
  if (!record) return false;
  if (rule.answeredOptionId !== undefined) {
    const chosen =
      record.optionIds || (record.optionId ? [record.optionId] : []);
    if (!chosen.includes(rule.answeredOptionId)) return false;
  }
  if (rule.outcome !== undefined && record.outcome !== rule.outcome) {
    return false;
  }
  if (
    rule.minAttempts !== undefined &&
    (record.attempts || 0) < rule.minAttempts
  ) {
    return false;
  }
  if (
    rule.scaleAtMost !== undefined &&
    (record.value === undefined || record.value > rule.scaleAtMost)
  ) {
    return false;
  }
  if (
    rule.scaleAtLeast !== undefined &&
    (record.value === undefined || record.value < rule.scaleAtLeast)
  ) {
    return false;
  }
  return true;
}
