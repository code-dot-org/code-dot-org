/**
 * Short text answers for a student's app, such as care tips for a plant the
 * model called sick. The student's question and the model's answer both
 * pass aichat's school-safety judge before the answer reaches the canvas.
 */

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {isTextSafe} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// The answer is drawn on a 400px canvas, so it must be short and plain.
const SYSTEM_PROMPT =
  'You write text that appears inside an app a middle school student is ' +
  'building. Answer in at most three short sentences, in plain words a ' +
  '12-year-old can read. Use no markdown, lists, or emoji.';

export const ASK_AI_UNSAFE = "Let's ask about something else.";
export const ASK_AI_FAILED = 'The AI could not answer. Try again.';

/**
 * The model's answer, or one of the two fixed messages above. Never throws:
 * the caller is interpreted student code, which has no way to catch.
 */
export async function askAi(question: string): Promise<string> {
  const text = question.trim();
  if (!text) {
    return '';
  }
  try {
    // The judge and the answer run together; a flagged question discards
    // the answer unread.
    const [questionSafe, result] = await Promise.all([
      isTextSafe(text, 'input_filter'),
      generateText(
        {
          model: getModel(AiChatModelIds.GEMINI_2_5_FLASH),
          system: SYSTEM_PROMPT,
          prompt: text,
        },
        {phase: 'generation'}
      ),
    ]);
    if (!questionSafe) {
      return ASK_AI_UNSAFE;
    }
    const answer = result.text.trim();
    if (!answer) {
      return ASK_AI_FAILED;
    }
    return (await isTextSafe(answer, 'output_filter')) ? answer : ASK_AI_UNSAFE;
  } catch (e) {
    console.error('SpriteLab2: ask AI failed:', e);
    return ASK_AI_FAILED;
  }
}
