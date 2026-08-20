// Skill-path mastery evaluation: when a student completes the last step
// of a hub path, one LLM call judges whether their recorded work
// demonstrates the path's learning objective (and official standard,
// when authored).  The verdict is stored on the progress snapshot and
// shown to the teacher; a later phase uses a failed verdict's `gaps` to
// generate remediation steps appended to the path.
//
// Runs in the background after the student has already returned to the
// hub — never blocks navigation.  Callers treat an LLM failure as
// mastered (fail-open: an outage must not flag students).

import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {loggedGenerateText} from './aiLog';
import {StudentInputs} from './studentInputs';
import {PathMastery, StepObservation} from './studentProgress';
import {LessonPlan, pathStepsFor, SkillPath} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;

// `reasoning` and `gaps` precede the verdict so the model commits to
// its reading of the evidence before deciding.
const masterySchema = Output.object({
  schema: z.object({
    reasoning: z
      .string()
      .describe(
        '2-3 teacher-facing sentences citing the specific evidence for or against mastery. Third person ("the student").'
      ),
    gaps: z
      .array(z.string())
      .describe(
        'When not mastered: what specifically is missing or weak, one gap per entry, concrete enough to design a practice exercise from. Empty when mastered.'
      ),
    mastered: z
      .boolean()
      .describe(
        'true only if the evidence shows the student demonstrated the objective. Thin or contradictory evidence means false.'
      ),
  }),
});

// One prompt block per path step: what the step asked, then everything
// the student did there — answers, AI prompts, outcomes, observations.
function formatEvidence(
  lesson: LessonPlan,
  stepIds: string[],
  inputs: StudentInputs,
  observations: {[stepId: string]: StepObservation} | undefined
): string {
  const blocks = stepIds.map(stepId => {
    const step = lesson.steps.find(s => s.id === stepId);
    const lines: string[] = [`Step "${step?.title || stepId}"`];
    if (step && step.kind !== 'panels' && step.description) {
      lines.push(`  Task: ${step.description}`);
    }
    const records = Object.values(inputs)
      .filter(r => r.stepId === stepId)
      .sort((a, b) => a.at.localeCompare(b.at));
    records.forEach(r => {
      const note =
        r.outcome && r.outcome !== 'accepted' ? ` [${r.outcome}]` : '';
      lines.push(`  - "${r.prompt}" → ${r.answer}${note}`);
    });
    if (records.length === 0) lines.push('  (nothing recorded)');
    const obs = observations?.[stepId];
    if (obs) {
      lines.push(
        `  Observation${obs.score !== undefined ? ` (${obs.score}/4)` : ''}: ${
          obs.summary
        }`
      );
    }
    return lines.join('\n');
  });
  return blocks.join('\n\n');
}

export async function evaluatePathMastery(options: {
  lesson: LessonPlan;
  path: SkillPath;
  inputs: StudentInputs;
  observations?: {[stepId: string]: StepObservation};
  // The student's work at path completion, when a lab step ended it.
  work?: string;
}): Promise<PathMastery> {
  initAiLessonsGatewayContext();
  const {lesson, path, inputs, observations, work} = options;
  const stepIds = pathStepsFor(lesson, path);

  const response = await loggedGenerateText('mastery evaluation', {
    model: getModel(MODEL_ID),
    system: `You evaluate whether a K-12 student has demonstrated mastery of
one skill path in a computer-science lesson, for their teacher.  Judge
ONLY against the objective${path.standard ? ' and standard' : ''} below,
using the recorded evidence — not effort, not completion.  Completing
steps is not mastery; the evidence must show the objective demonstrated.

LESSON: ${lesson.title}
SKILL PATH: ${path.title}
OBJECTIVE: ${path.objective || '(none authored — judge holistically)'}${
      path.standard ? `\nSTANDARD: ${path.standard}` : ''
    }`,
    prompt: `EVIDENCE, per step of the path (oldest first):

${formatEvidence(lesson, stepIds, inputs, observations)}${
      work ? `\n\nFINAL WORK AT PATH COMPLETION:\n${work}` : ''
    }`,
    temperature: 0.2,
    output: masterySchema,
  });

  const raw = response.output as {
    reasoning?: string;
    gaps?: string[];
    mastered?: boolean;
  };
  return {
    mastered: Boolean(raw.mastered),
    reasoning: String(raw.reasoning || '').trim(),
    gaps: (raw.gaps || []).map(g => String(g)).filter(Boolean),
    at: new Date().toISOString(),
  };
}
