import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AichatContext} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import {
  AiChatClientTypes,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

// The Flow Lab client type is open to any signed-in user; this lab has no
// client type of its own yet.
const aichatContext: AichatContext = {
  clientType: AiChatClientTypes.FLOW_LAB,
  currentLevelId: null,
  scriptId: null,
  channelId: undefined,
};

const systemPrompt =
  'You are a character in a game a student is making.  ' +
  'Answer in plain text, no markdown, in one or two short sentences a ' +
  'ten-year-old can read.';

const timeoutMs = 30000;

/** What the student sees when the model cannot or will not answer. */
export const NO_ANSWER = 'I cannot answer that.';

/** One prompt in, one plain-text answer out, through the AI gateway. */
export async function askAi(prompt: string): Promise<string> {
  const result = await withTimeout(
    generateText(
      {
        model: getModel(AiChatModelIds.GEMINI_2_5_FLASH),
        system: systemPrompt,
        prompt,
      },
      {phase: 'generation', aichatContext}
    ),
    timeoutMs
  );
  if (result.finishReason === 'content-filter') {
    return NO_ANSWER;
  }
  return result.text?.trim() || NO_ANSWER;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('The AI took too long to answer.')),
      ms
    );
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}
