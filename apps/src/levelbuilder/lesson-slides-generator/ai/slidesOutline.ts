import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import {LevelPropertiesMap} from '@cdo/apps/lab2/types';

import {
  getTextModel,
  logPrompt,
  logResponse,
  PROMPT_TAGS,
} from '../../lesson-generator/ai/shared';

const slidesOutlineSchema = Output.object({
  schema: z.object({
    slides: z
      .array(
        z.object({
          description: z
            .string()
            .describe(
              'A 2-5 sentence description of what should appear on this single slide. Will be turned into a single Panels-app panel (one image + a short text overlay) by a later AI call. Focus on what the student should see and learn from this slide; do NOT spell out the panel text or describe a specific image.'
            ),
        })
      )
      .min(1)
      .max(20),
  }),
});

export interface OutlineSlide {
  description: string;
}

// Given the lesson's existing levels (their content) plus the user's
// optional outline prompt for the slides, ask the model for a sequence
// of slide descriptions to show students BEFORE the lesson.
//
// The slides should set up context for the lesson without giving away
// the work. Concretely: introduce the topic and stakes, motivate why
// this matters, mention the technique or concept the student is about
// to use, but stop short of walking through the solution.
export async function generateSlidesOutline(
  lessonName: string,
  outline: string | undefined,
  levelPropertiesById: LevelPropertiesMap
): Promise<OutlineSlide[]> {
  const lessonContext = JSON.stringify(levelPropertiesById, null, 2);
  const prompt = [
    'You are helping a curriculum author plan a sequence of intro slides',
    'shown to a middle-school CS student BEFORE they begin a lesson. The',
    'slides set up context — what the lesson is about, why it matters,',
    'and what concept or technique they are about to practice. They must',
    'NOT walk through the solution to any level; they should leave the',
    'student with curiosity and just enough framing to engage productively.',
    '',
    'Each slide will be implemented as a single Panels-app panel (one',
    '16:9 illustration + short text overlay). Plan 1 to 20 slides; default',
    'to 3-6 unless the outline below asks for more.',
    '',
    `Lesson: ${lessonName}`,
    '',
    ...(outline?.trim()
      ? ['Outline (the levelbuilder typed this; honor it):', outline.trim(), '']
      : []),
    'Lesson level content (the existing generated levels of this lesson,',
    'in order). Use these to understand what the student is about to do',
    'so the slides can set the stage without spoiling solutions:',
    lessonContext,
    '',
    'For each slide, return a 2-5 sentence description of what the slide',
    'should show. Describe intent — topic, mood, what concept lands here',
    '— not panel-specific things like exact wording or image composition;',
    'a downstream AI call will turn each description into the actual',
    'panel text + image.',
  ].join('\n');

  const context = {level: lessonName, subtask: 'slides-outline'};
  logPrompt(PROMPT_TAGS.LESSON_OUTLINE, prompt, context);
  const response = await generateText({
    model: getTextModel(),
    prompt,
    output: slidesOutlineSchema,
  });
  const slides = (response.output as {slides: OutlineSlide[]}).slides;
  logResponse(PROMPT_TAGS.LESSON_OUTLINE, slides, context);
  if (!slides?.length) {
    throw new Error('Model returned no slides');
  }
  return slides;
}
