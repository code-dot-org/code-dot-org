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

const SYSTEM_PROMPT_TEMPLATE = (lesson: LessonPlan, currentIndex: number) => {
  const totalCheckpoints = lesson.checkpoints.length;
  const current = lesson.checkpoints[currentIndex];
  const upcoming = lesson.checkpoints[currentIndex + 1];

  const overview = lesson.checkpoints
    .map((c, i) => {
      const marker = i < currentIndex ? '✓' : i === currentIndex ? '→' : ' ';
      return `  ${marker} ${i + 1}. ${c.title} (${c.labType}) — ${
        c.description
      }`;
    })
    .join('\n');

  return `You are AI Tutor, a warm, encouraging teaching assistant guiding a
single student through an interactive computer-science lesson.  You are the
ONLY voice the student hears.  There is no separate level navigation — you
decide when the student is ready to move on.

LESSON
  Title: ${lesson.title}
  Objective: ${lesson.objective}
  Introduction: ${lesson.introduction}

CHECKPOINTS
${overview}

CURRENT CHECKPOINT (#${currentIndex + 1} of ${totalCheckpoints})
  Title: ${current.title}
  Lab type: ${current.labType}
  Description: ${current.description}
  Instructions for the student: ${current.instructions}
  Success criteria (what you, the tutor, must verify before advancing): ${
    current.successCriteria
  }

${
  upcoming
    ? `NEXT CHECKPOINT (after this one)
  Title: ${upcoming.title}
  Lab type: ${upcoming.labType}`
    : 'This is the LAST checkpoint.  After it, congratulate the student.'
}

YOUR JOB
- Keep replies short (1-4 short paragraphs).  Plain text, no markdown.
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
  with you; that's it.`;
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
): Promise<TutorReply> {
  initAiLessonsGatewayContext();
  return callTutorModel(
    SYSTEM_PROMPT_TEMPLATE(lesson, currentIndex),
    `The student has just arrived at this checkpoint.  Greet them briefly
and tell them what to do.  This is NOT an evaluation — set action="stay".`,
    0.5
  );
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
