/**
 * Activity Creation Prompts
 *
 * These prompts help teachers create classroom activities and materials.
 * Use this file for prompts that:
 * - Generate extension activities for different student needs
 * - Create assessment materials (exit tickets, etc.)
 * - Generate mini-lessons or lesson hooks
 * - Produce any student-facing activities or materials
 *
 * These prompts are typically used in the "create" context.
 */

import {ChatPrompt} from '../types';

export const FINISH_EARLY_PROMPT: ChatPrompt = {
  label: 'Write an extension activity for students who finish early',
  prompt:
    'Write an extension activity for this lesson for students who finish early',
};

export const EXTRA_PRACTICE_PROMPT: ChatPrompt = {
  label: 'Write an extension activity for extra practice',
  prompt:
    'Write an extension activity for this lesson for students who need extra practice',
};

export const EXIT_TICKET_PROMPT: ChatPrompt = {
  label: 'Write an exit ticket',
  prompt:
    'I need an exit ticket to quickly assess if my class understood a concept. You can ask me a follow-up question to find out what concept needs to be assessed and if they have a preference in question type.',
};

export const MINI_LESSON_PROMPT: ChatPrompt = {
  label: 'Generate a mini lesson',
  prompt: `I need a mini lesson.  You can ask me a follow-up question to find out what concept needs to be assessed and how much time they have. Ask about any known misconceptions in the class.

    Create a 10-15 (adjust for time based on their answer) minute mini-lesson on [use the topic given by the teacher] for teaching computer science. Include:
    1. An engaging hook that connects to students' real-world experiences
    2. A clear, specific learning objective that can be achieved in this timeframe
    3. A step-by-step demonstration that shows your thought process
    4. At least two points of student interaction or checks for understanding
    5. One common misconception or error to address (use the misconception they provide)
    6. A 2-3 minute practice exercise that lets students apply the concept immediately

    Focus on a single, specific concept that students can understand and practice right away. Keep explanations concise and student-friendly.`,
};

export const LESSON_HOOK_PROMPT: ChatPrompt = {
  label: 'Write a lesson hook',
  prompt: `I need a lesson hook to engage students on a topic. You can write a message asking teachers for the essential context needed to create an engaging lesson hook. The message should:
    - Request student age/grade level
    - Ask about student interests and hobbies
    - Ask about recent class topics or context
    - Ask about the specific concept being introduced
    Use this information to create a relevant, 1-2 minute hook that connects to students' experiences and creates curiosity about the new concept.

    Format the questions as a clear, easy-to-read list`,
};
