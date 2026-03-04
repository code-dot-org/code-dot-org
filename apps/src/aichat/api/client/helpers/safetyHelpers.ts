import {Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway/aiSdkCompatibleGateway';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {getModel} from './modelHelpers';

const outputSchema = Output.object({
  schema: z.object({
    classification: z
      .enum(['OK', 'INAPPROPRIATE'])
      .describe('Safety classification for school appropriateness'),
  }),
});

interface SafetyConfig {
  modelId: ValueOf<typeof AiChatModelIds>;
  safetySystemPrompt: string;
}

const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
  modelId: AiChatModelIds.CHATGPT,
  safetySystemPrompt:
    'You are a content filter trying to keep a school teacher out of trouble. Determine if chat text is inappropriate for an American public middle school classroom. Examples of inappropriate content: profanity, swears, illegal behavior, insults, bullying, slurs, sex, violence, racism, sexism, threats, weapons, dirty slang, etc. If text is inappropriate, respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`.',
};

/**
 * Invokes an LLM to determine if the given text is safe.
 */
export async function isTextSafe(
  text: string,
  customSafetyConfig?: Partial<SafetyConfig>
): Promise<boolean> {
  const safetyConfig = {
    ...DEFAULT_SAFETY_CONFIG,
    ...customSafetyConfig,
  };

  const response = await generateText({
    prompt: `${safetyConfig.safetySystemPrompt}. Here is the text to classify: ${text}`,
    output: outputSchema,
    model: getModel(safetyConfig.modelId),
  });

  const classification = response.output.classification;
  if (!['OK', 'INAPPROPRIATE'].includes(classification)) {
    throw new Error('Invalid classification value: ' + classification);
  }
  return classification === 'OK';
}
