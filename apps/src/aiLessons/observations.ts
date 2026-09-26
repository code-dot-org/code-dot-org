// Rubric-scored step observations: when a lab step carries an authored
// `rubric`, completing it triggers one LLM call that looks at HOW the
// student worked — their AI prompts and attempts for the step, and their
// final work — and produces a short teacher-facing summary plus a 0-4
// effectiveness score.  Stored on the progress snapshot (keyed by step
// id) and fed back into the tutor's context.
//
// This is deliberately about process, not product: the tutor already
// judges the work itself against success criteria and the checklist.

import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {loggedGenerateText} from './aiLog';
import {StudentInputs} from './studentInputs';
import {StepObservation} from './studentProgress';
import {LabStep, LessonPlan} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;

const observationSchema = Output.object({
  schema: z.object({
    summary: z
      .string()
      .describe(
        "2-3 plain sentences for the teacher about HOW the student worked — their approach, persistence, and how they used the AI. Not a description of the code. Third person ('the student')."
      ),
    score: z
      .number()
      .int()
      .min(0)
      .max(4)
      .describe(
        'Effectiveness per the rubric: 0 = no meaningful progress or engagement, 4 = highly effective, targeted work.'
      ),
  }),
});

// The step's own activity trail: prompts the student sent the build
// partner during this step, and graded answers tied to it.
function formatStepActivity(step: LabStep, inputs: StudentInputs): string {
  const records = Object.values(inputs)
    .filter(r => r.stepId === step.id)
    .sort((a, b) => a.at.localeCompare(b.at));
  if (records.length === 0) return '(no prompts or answers recorded)';
  return records
    .map(r => {
      const note =
        r.outcome && r.outcome !== 'accepted' ? ` [${r.outcome}]` : '';
      const files = r.changedFiles?.length
        ? ` [changed: ${r.changedFiles.join(', ')}]`
        : '';
      return `  - ${r.answer}${note}${files}`;
    })
    .join('\n');
}

export async function generateStepObservation(options: {
  lesson: LessonPlan;
  step: LabStep;
  inputs: StudentInputs;
  work?: string;
}): Promise<StepObservation> {
  initAiLessonsGatewayContext();
  const {lesson, step, inputs, work} = options;

  const response = await loggedGenerateText('step observation', {
    model: getModel(MODEL_ID),
    system: `You observe how a K-12 student worked through one step of a
computer-science lesson and report to their teacher.  Score against the
step's rubric; summarise the student's process, not their code.

LESSON: ${lesson.title} — ${lesson.objective}
STEP: ${step.title}${step.description ? ` — ${step.description}` : ''}

RUBRIC (what to observe and how to score)
${step.rubric || '(none — describe their approach and score holistically)'}`,
    prompt: `STUDENT ACTIVITY ON THIS STEP (prompts sent to the AI build
partner and graded answers, oldest first):
${formatStepActivity(step, inputs)}

FINAL WORK AT COMPLETION:
${work || '(no work snapshot available)'}`,
    temperature: 0.3,
    output: observationSchema,
  });

  const raw = response.output;
  const score = Number(raw.score);
  return {
    summary: String(raw.summary || '').trim(),
    score: Number.isInteger(score)
      ? Math.min(4, Math.max(0, score))
      : undefined,
    at: new Date().toISOString(),
  };
}
