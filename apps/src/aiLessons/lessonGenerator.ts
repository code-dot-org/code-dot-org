// AI-backed lesson plan generation.
//
// Takes a single free-text prompt from the curriculum author describing
// what they want — topic, audience, lab mix, etc. — and asks the AI
// Gateway to produce a complete, structured LessonPlan in one shot:
// title, ordered checkpoints, lab type assignments, per-checkpoint
// descriptions, success criteria, and panel captions where appropriate.
//
// We constrain the model output with `Output.object` + a zod schema so
// the gateway hands us a parsed object directly (no JSON-from-prose
// scraping).

import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {getCapabilitiesMarkdownAll} from './labCapabilities';
import {Checkpoint, LabType, LessonPlan, PanelSlide} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_PRO;

const LAB_DESCRIPTIONS: Record<LabType, string> = {
  weblab2:
    'Web Lab 2 — a beginner-friendly HTML/CSS/JS editor for building web pages. Students can edit index.html, style.css, and script.js and see a live preview.',
  music:
    'Music Lab — a block-based music sequencer where students compose tracks by stacking sounds across measures.',
  panels:
    'Instructional Panels — a simple slideshow of caption-only panels. Use this for explanations, demonstrations, and recaps. No coding happens in panels checkpoints.',
};

const lessonPlanSchema = Output.object({
  schema: z.object({
    title: z.string().describe('A punchy lesson title.'),
    objective: z
      .string()
      .describe('One-sentence learning objective for the whole lesson.'),
    checkpoints: z
      .array(
        z.object({
          title: z
            .string()
            .describe('Concise 3-7 word student-facing heading.'),
          description: z
            .string()
            .describe(
              'For weblab2 and music checkpoints: 2-4 short paragraphs describing what the student should do and the context the AI Tutor needs to guide them. Plain text. Not shown to the student directly — the tutor turns it into natural-language instructions on the fly. For panels checkpoints: leave this an empty string, because the slide captions themselves carry the content.'
            ),
          labType: z
            .enum(['weblab2', 'music', 'panels'])
            .describe(
              'Which lab the student uses in this checkpoint. Pick the lab best suited to the content; use "panels" for purely instructional setup or recap steps.'
            ),
          successCriteria: z
            .string()
            .describe(
              'For weblab2 and music checkpoints: 1-2 sentences describing what the AI Tutor should look for in the student work to decide this checkpoint is complete. Be observable and specific. For panels checkpoints: leave this an empty string — panels advance via the Continue button, not via tutor evaluation.'
            ),
          panels: z
            .array(
              z.object({
                caption: z
                  .string()
                  .describe('One sentence shown on a slide. Plain text.'),
              })
            )
            .describe(
              'For panels checkpoints, 2-5 caption-only slides that teach or recap the concept. For non-panels checkpoints, leave this as an empty array.'
            ),
        })
      )
      .describe('Ordered list of checkpoints the student works through.'),
  }),
});

const SYSTEM_PROMPT = `You are a curriculum designer for K-12 computer science.
You take a single free-text prompt from a teacher and produce a complete
lesson plan that a student will work through with the help of an AI Tutor.

The student will move through the checkpoints in order.  Each checkpoint is
assigned to one of three "lab types":

${Object.entries(LAB_DESCRIPTIONS)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

Guidance:
- If the teacher names labs explicitly, honour those choices.  Otherwise
  pick the lab best suited to each checkpoint's content.
- Use "panels" checkpoints for purely instructional setup, mid-lesson
  explanations, and recap/celebration steps.  Surround coding checkpoints
  with at least one panels checkpoint when it helps the narrative.
- Make sure the lesson hangs together: title and objective set up the
  arc; checkpoints build on each other; success criteria are observable
  and specific to what the student would actually produce in that lab.

${getCapabilitiesMarkdownAll()}`;

function genCheckpointId(index: number): string {
  return `cp-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

interface RawCheckpoint {
  title: string;
  description: string;
  labType: LabType;
  successCriteria: string;
  panels: {caption: string}[];
}

function coerceCheckpoint(raw: RawCheckpoint, index: number): Checkpoint {
  const labType: LabType =
    raw.labType === 'weblab2' || raw.labType === 'music'
      ? raw.labType
      : 'panels';
  const panels: PanelSlide[] | undefined =
    labType === 'panels'
      ? (raw.panels || [])
          .map(p => ({caption: String(p?.caption || '').trim()}))
          .filter(p => p.caption.length > 0)
      : undefined;

  return {
    id: genCheckpointId(index),
    title: String(raw.title || `Checkpoint ${index + 1}`).trim(),
    description: String(raw.description || '').trim(),
    labType,
    successCriteria: String(raw.successCriteria || '').trim(),
    panels,
  };
}

export async function generateLessonFromPrompt(
  prompt: string
): Promise<LessonPlan> {
  initAiLessonsGatewayContext();

  const response = await generateText({
    model: getModel(MODEL_ID),
    system: SYSTEM_PROMPT,
    prompt: prompt.trim(),
    temperature: 0.5,
    output: lessonPlanSchema,
  });

  const raw = response.output as {
    title?: string;
    objective?: string;
    checkpoints?: RawCheckpoint[];
  };
  const checkpoints: Checkpoint[] = (raw.checkpoints || []).map(
    (c: RawCheckpoint, i: number) => coerceCheckpoint(c, i)
  );

  return {
    title: String(raw.title || 'Untitled Lesson').trim(),
    objective: String(raw.objective || '').trim(),
    checkpoints,
    authorInputs: {prompt: prompt.trim()},
  };
}
