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
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {loggedGenerateText} from './aiLog';
import {getCapabilitiesMarkdownAll} from './labCapabilities';
import {LessonPlan, PanelSlide, Step} from './types';

// NOTE: the generator still speaks the v1 vocabulary (a flat list of
// "checkpoints", each weblab2/music/panels) and its output is coerced to
// lab/panels steps.  Teaching it the full step model — questions,
// branching, segments, checklists — is deferred until authoring tools
// (the exemplar lessons are hand-written JSON until then).

const MODEL_ID = AiChatModelIds.GEMINI_2_5_PRO;

const LAB_DESCRIPTIONS: {[key: string]: string} = {
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

function genStepId(index: number): string {
  return `step-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

interface RawCheckpoint {
  title: string;
  description: string;
  labType: string;
  successCriteria: string;
  panels: {caption: string}[];
}

function coerceStep(raw: RawCheckpoint, index: number): Step {
  const id = genStepId(index);
  const title = String(raw.title || `Step ${index + 1}`).trim();

  if (raw.labType !== 'weblab2' && raw.labType !== 'music') {
    const panels: PanelSlide[] = (raw.panels || [])
      .map(p => ({caption: String(p?.caption || '').trim()}))
      .filter(p => p.caption.length > 0);
    return {
      id,
      title,
      kind: 'panels',
      panels: panels.length > 0 ? panels : [{caption: title}],
    };
  }

  const successCriteria = String(raw.successCriteria || '').trim();
  return {
    id,
    title,
    kind: 'lab',
    labType: raw.labType,
    description: String(raw.description || '').trim(),
    validation: successCriteria ? 'tutor' : 'none',
    successCriteria: successCriteria || undefined,
  };
}

export async function generateLessonFromPrompt(
  prompt: string
): Promise<LessonPlan> {
  initAiLessonsGatewayContext();

  const response = await loggedGenerateText('lesson generator', {
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
  const steps: Step[] = (raw.checkpoints || []).map(
    (c: RawCheckpoint, i: number) => coerceStep(c, i)
  );

  return {
    formatVersion: 2,
    title: String(raw.title || 'Untitled Lesson').trim(),
    objective: String(raw.objective || '').trim(),
    steps,
    authorInputs: {prompt: prompt.trim()},
  };
}
