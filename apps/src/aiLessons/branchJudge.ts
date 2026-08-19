// The AI-judged branch condition: when a step's `branches` carry an
// `aiJudge` condition, the resolver asks this judge whether the
// student's recorded inputs for the named step (their build prompts and
// answers) meet the authored criteria.  Pass → the branch routes; fail
// or no recorded inputs → the condition doesn't match and the step
// falls through to its default path.  LLM errors propagate — the
// resolver already treats a throwing judge as no-match.
//
// StudentPage injects this as NavContext.judgeCondition, keeping
// navigation.ts free of LLM dependencies.

import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {loggedGenerateText} from './aiLog';
import {NavContext} from './navigation';
import {BranchCondition} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;

// `reason` first so the model commits to its reading of the evidence
// before the verdict.
const verdictSchema = Output.object({
  schema: z.object({
    reason: z
      .string()
      .describe(
        'One or two sentences citing what in the student record does or does not meet the criteria.'
      ),
    pass: z
      .boolean()
      .describe(
        'true only if the record clearly meets the criteria. When in doubt, false.'
      ),
  }),
});

export async function judgeBranchCondition(
  aiJudge: NonNullable<BranchCondition['aiJudge']>,
  ctx: NavContext
): Promise<boolean> {
  const records = Object.values(ctx.inputs || {})
    .filter(r => r.stepId === aiJudge.stepId)
    .sort((a, b) => a.at.localeCompare(b.at));
  // Nothing to judge — deterministic no-match, no LLM call.
  if (records.length === 0) return false;

  initAiLessonsGatewayContext();
  const step = ctx.lesson.steps.find(s => s.id === aiJudge.stepId);

  const response = await loggedGenerateText('branch judge', {
    model: getModel(MODEL_ID),
    system: `You are a routing judge inside a K-12 computer-science lesson.
The lesson branches based on the student's performance on one step; your
verdict decides which path they take.  Judge the student's recorded
activity against the criteria — nothing else.  The student never sees
this; be strict and literal about the criteria.

LESSON: ${ctx.lesson.title}
STEP UNDER REVIEW: ${step ? step.title : aiJudge.stepId}${
      step && step.kind !== 'panels' && step.description
        ? ` — ${step.description}`
        : ''
    }

CRITERIA (pass only if the record clearly meets this):
${aiJudge.criteria}`,
    prompt: `STUDENT RECORD FOR THIS STEP (oldest first):
${records
  .map(r => {
    const note = r.outcome && r.outcome !== 'accepted' ? ` [${r.outcome}]` : '';
    return `  - "${r.prompt}" → ${r.answer}${note}`;
  })
  .join('\n')}`,
    temperature: 0,
    output: verdictSchema,
  });

  return Boolean((response.output as {pass?: boolean}).pass);
}
