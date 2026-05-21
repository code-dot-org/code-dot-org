// AI Tutor brain for the AI Lessons student page.
//
// The tutor takes the full lesson plan, the current checkpoint index, the
// running chat transcript, and an optional "student work snapshot" provided
// by the student (or scraped live from Redux) and produces:
//   - a chat reply to show the student
//   - a decision: stay on the current checkpoint, or advance to the next
//
// We constrain the model output with `Output.object` + a zod schema so we
// get a structured object back from the gateway directly — no homemade
// JSON-from-prose parsing.

import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {getCapabilitiesMarkdownFor} from './labCapabilities';
import {LessonPlan} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;

export type TutorRole = 'tutor' | 'student';

export interface TutorMessage {
  role: TutorRole;
  text: string;
}

export type TutorAction = 'stay' | 'advance' | 'celebrate';

export interface TutorReply {
  message: string;
  action: TutorAction;
  reasoning?: string;
}

const tutorReplySchema = Output.object({
  schema: z.object({
    message: z.string().describe('Your reply to the student. Plain text.'),
    action: z
      .enum(['stay', 'advance', 'celebrate'])
      .describe(
        'Set to "advance" only if the success criteria are clearly met and there is a next checkpoint; "celebrate" if this is the final checkpoint and the criteria are met; otherwise "stay".'
      ),
    reasoning: z
      .string()
      .optional()
      .describe('One sentence on why you chose that action.'),
  }),
});

// Openings are split into two discrete pieces so the UI can style them
// differently (small welcome line, larger call-to-action). Markdown is
// still allowed within each (e.g. inline `code`), but the welcome and
// instruction live in separate fields.
export interface TutorOpening {
  welcome: string;
  instruction: string;
}

const tutorOpeningSchema = Output.object({
  schema: z.object({
    welcome: z
      .string()
      .describe(
        'One friendly sentence framing what the student is about to do. ≤12 words. No "Do this:" prefix.'
      ),
    instruction: z
      .string()
      .describe(
        'ONE concrete sentence describing the single action the student should take right now. ≤15 words. Plain text — no "Do this:" prefix, no bullet, no preamble.'
      ),
  }),
});

const SYSTEM_PROMPT_TEMPLATE = (lesson: LessonPlan, currentIndex: number) => {
  const totalCheckpoints = lesson.checkpoints.length;
  const current = lesson.checkpoints[currentIndex];
  const upcoming = lesson.checkpoints[currentIndex + 1];

  const overview = lesson.checkpoints
    .map((c, i) => {
      const marker = i < currentIndex ? '✓' : i === currentIndex ? '→' : ' ';
      const tail = c.description ? ` — ${c.description}` : '';
      return `  ${marker} ${i + 1}. ${c.title} (${c.labType})${tail}`;
    })
    .join('\n');

  // Panels checkpoints don't have a description or success criteria —
  // the slide captions carry the content and Continue advances directly.
  // Skip the empty lines so the prompt doesn't dangle them.
  const currentDetails = [
    `  Title: ${current.title}`,
    `  Lab type: ${current.labType}`,
    current.description &&
      `  Description (what the student should do — turn this into your own
  natural-language guidance for the student; never paste it verbatim):
  ${current.description}`,
    current.successCriteria &&
      `  Success criteria (what you, the tutor, must verify before advancing): ${current.successCriteria}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `You are AI Tutor, a warm, encouraging teaching assistant guiding a
single student through an interactive computer-science lesson.  You are the
ONLY voice the student hears.  There is no separate level navigation — you
decide when the student is ready to move on.

LESSON
  Title: ${lesson.title}
  Objective: ${lesson.objective}

CHECKPOINTS
${overview}

CURRENT CHECKPOINT (#${currentIndex + 1} of ${totalCheckpoints})
${currentDetails}

${
  upcoming
    ? `NEXT CHECKPOINT (after this one)
  Title: ${upcoming.title}
  Lab type: ${upcoming.labType}`
    : 'This is the LAST checkpoint.  After it, congratulate the student.'
}

YOUR JOB
- Keep replies short (1-4 short paragraphs).  Markdown is rendered, so
  feel free to use **bold**, *italics*, bullet lists, and inline \`code\`
  to highlight what matters.  Don't overdo it.
- Stay focused on the current checkpoint.  If the student wanders, gently
  bring them back.
- When the student shares their work (code, a description, or by clicking
  "Check my work"), evaluate it against the success criteria.
- If the success criteria are clearly met, set action="advance" and write a
  brief celebratory transition that previews the next checkpoint.
- If this is the final checkpoint and the criteria are met, set
  action="celebrate".
- Otherwise set action="stay" and give targeted, actionable feedback —
  one or two specific suggestions.  Never advance prematurely.
- Do not invent UI controls.  The student has the lab on screen and a chat
  with you; that's it.

${getCapabilitiesMarkdownFor(current.labType)}`;
};

function formatTranscript(
  history: TutorMessage[],
  studentWork: string | undefined
): string {
  const lines: string[] = [];
  history.forEach(m => {
    const speaker = m.role === 'tutor' ? 'Tutor' : 'Student';
    lines.push(`${speaker}: ${m.text}`);
  });
  if (studentWork && studentWork.trim()) {
    lines.push('');
    lines.push('STUDENT WORK SNAPSHOT (provided by the student):');
    lines.push(studentWork.trim());
  }
  return lines.join('\n');
}

async function callTutorModel(
  system: string,
  prompt: string,
  temperature: number
): Promise<TutorReply> {
  const response = await generateText({
    model: getModel(MODEL_ID),
    system,
    prompt,
    temperature,
    output: tutorReplySchema,
  });

  const raw = response.output;
  const action: TutorAction =
    raw.action === 'advance' || raw.action === 'celebrate'
      ? raw.action
      : 'stay';
  return {
    message: String(raw.message || '').trim(),
    action,
    reasoning: raw.reasoning ? String(raw.reasoning) : undefined,
  };
}

export async function generateTutorOpening(
  lesson: LessonPlan,
  currentIndex: number
): Promise<TutorOpening> {
  initAiLessonsGatewayContext();
  const isFirst = currentIndex === 0;
  const response = await generateText({
    model: getModel(MODEL_ID),
    system: SYSTEM_PROMPT_TEMPLATE(lesson, currentIndex),
    prompt: `The student has just arrived at this checkpoint.  Return:

welcome:  ONE friendly ${
      isFirst ? 'welcome' : 'transition'
    } sentence, ≤12 words.  ${
      isFirst
        ? `Examples: "Welcome! Today we're making a beat in Music Lab." / "Hey! Let's build a tiny webpage."`
        : `Examples: "Nice work! Next up: loops." / "Great — now let's add sound effects."`
    }

instruction:  ONE concrete sentence describing the single action the
student should take right now.  ≤15 words.  No "Do this:" prefix —
the UI renders that for you.  No preamble, no follow-up tips, no
bullets.

Do not greet the student by name.  This is NOT an evaluation.`,
    temperature: 0.5,
    output: tutorOpeningSchema,
  });
  const raw = response.output;
  return {
    welcome: String(raw.welcome || '').trim(),
    instruction: String(raw.instruction || '').trim(),
  };
}

export async function generateTutorReply(
  lesson: LessonPlan,
  currentIndex: number,
  history: TutorMessage[],
  studentWork?: string
): Promise<TutorReply> {
  initAiLessonsGatewayContext();
  return callTutorModel(
    SYSTEM_PROMPT_TEMPLATE(lesson, currentIndex),
    formatTranscript(history, studentWork),
    0.4
  );
}
