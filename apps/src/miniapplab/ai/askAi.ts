import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AichatContext} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import {
  AiChatClientTypes,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

// No level or project behind the prototype yet.  Flow Lab is the client type
// any signed-in user may use.
const aichatContext: AichatContext = {
  clientType: AiChatClientTypes.FLOW_LAB,
  currentLevelId: null,
  scriptId: null,
  channelId: undefined,
};

const systemPrompt =
  'You are the AI inside a small app a student built.  ' +
  'Answer the prompt helpfully in plain text, without markdown, in a few sentences at most.';

const timeoutMs = 30000;

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
    return 'The AI could not answer that.';
  }
  return result.text?.trim() || '';
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
