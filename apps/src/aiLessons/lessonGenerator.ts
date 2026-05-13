// AI-backed lesson plan generation.
//
// Given an author's objective and a list of checkpoint inputs (each with a
// short description and a desired lab type), call the AI Gateway to produce
// a full LessonPlan: title, introduction, and per-checkpoint instructions
// plus success criteria.  For checkpoints whose lab type is "panels", the
// model also produces a small list of slide captions.

import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {
  Checkpoint,
  CheckpointInput,
  LabType,
  LessonPlan,
  PanelSlide,
} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;

const LAB_DESCRIPTIONS: Record<LabType, string> = {
  weblab2:
    'Web Lab 2 — a beginner-friendly HTML/CSS/JS editor for building web pages. Students can edit index.html, style.css, and script.js and see a live preview.',
  music:
    'Music Lab — a block-based music sequencer where students compose tracks by stacking sounds across measures.',
  panels:
    'Instructional Panels — a simple slideshow of caption-only panels. Use this for explanations, demonstrations, and recaps. No coding happens in panels checkpoints.',
};

interface RawCheckpoint {
  title: string;
  instructions: string;
  successCriteria: string;
  panels?: {caption: string}[];
}

interface RawLessonPlan {
  title: string;
  introduction: string;
  checkpoints: RawCheckpoint[];
}

const SYSTEM_PROMPT = `You are a curriculum designer for K-12 computer science.  You take a
lesson objective and a sequence of high-level checkpoint descriptions written
by a teacher, and you produce a detailed lesson plan that a student will work
through with the help of an AI Tutor.

The student will move through the checkpoints in order.  Each checkpoint is
assigned to one of three "lab types":

${Object.entries(LAB_DESCRIPTIONS)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

For each checkpoint produce:
- title: a concise (3-7 word) student-facing heading
- instructions: 2-4 short paragraphs of student-facing instructions.  Use
  plain text only (no markdown).  Write directly to the student.  For lab
  types weblab2 and music, describe a concrete task the student will perform
  in that lab.  For panels, the "instructions" are a brief setup paragraph;
  the actual content lives in the "panels" field as slide captions.
- successCriteria: 1-2 sentences describing what the AI Tutor should look
  for in the student's work to decide the checkpoint is complete.  Be
  observable and specific.
- panels (only if labType is "panels"): an array of 2-5 short slide
  captions (one sentence each) that teach or recap the relevant concept.

Also produce:
- title: a punchy lesson title
- introduction: 2-3 sentence framing for the whole lesson, written for
  the student

Respond as JSON with exactly the schema requested.  Do not include any
prose outside the JSON.`;

function buildUserPrompt(objective: string, inputs: CheckpointInput[]): string {
  const lines = [
    `Lesson objective: ${objective}`,
    '',
    'Checkpoints (in order):',
  ];
  inputs.forEach((c, i) => {
    lines.push(
      `${i + 1}. [labType=${c.labType}] ${
        c.description.trim() || '(no description)'
      }`
    );
  });
  return lines.join('\n');
}

function genCheckpointId(index: number): string {
  return `cp-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

function extractJson(text: string): unknown {
  // Models sometimes wrap JSON in ```json fences despite instructions.  Strip
  // any leading/trailing fences before parsing.
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

function coerceCheckpoint(
  raw: RawCheckpoint,
  input: CheckpointInput,
  index: number
): Checkpoint {
  const panels: PanelSlide[] | undefined =
    input.labType === 'panels' && Array.isArray(raw.panels)
      ? raw.panels
          .map(p => ({caption: String(p?.caption || '').trim()}))
          .filter(p => p.caption.length > 0)
      : undefined;

  return {
    id: genCheckpointId(index),
    title: String(raw.title || `Checkpoint ${index + 1}`).trim(),
    description: input.description.trim(),
    labType: input.labType,
    instructions: String(raw.instructions || '').trim(),
    successCriteria: String(raw.successCriteria || '').trim(),
    panels,
  };
}

export async function generateLessonPlan(
  objective: string,
  inputs: CheckpointInput[]
): Promise<LessonPlan> {
  initAiLessonsGatewayContext();

  const userPrompt = buildUserPrompt(objective, inputs);

  const {text} = await generateText({
    model: MODEL_ID,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.4,
  });

  if (!text) {
    throw new Error('AI gateway returned an empty response.');
  }

  let parsed: RawLessonPlan;
  try {
    parsed = extractJson(text) as RawLessonPlan;
  } catch (e) {
    throw new Error(
      `Could not parse lesson plan JSON: ${(e as Error).message}`
    );
  }

  const rawCheckpoints: RawCheckpoint[] = Array.isArray(parsed.checkpoints)
    ? parsed.checkpoints
    : [];

  const checkpoints: Checkpoint[] = inputs.map((input, i) =>
    coerceCheckpoint(rawCheckpoints[i] || ({} as RawCheckpoint), input, i)
  );

  return {
    title: String(parsed.title || 'Untitled Lesson').trim(),
    objective: objective.trim(),
    introduction: String(parsed.introduction || '').trim(),
    checkpoints,
    authorInputs: {
      objective: objective.trim(),
      checkpointInputs: inputs.map(c => ({
        description: c.description.trim(),
        labType: c.labType,
      })),
    },
  };
}
