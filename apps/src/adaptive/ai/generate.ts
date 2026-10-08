// The adaptive shell's one way to ask a model for something: structured
// output through the AI gateway, under its own client type, off until a DCDO
// flag opts in, and never an exception to the caller. Every feature built on
// it has a no-AI result it falls back to.

import {Output} from 'ai';
import {z} from 'zod';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AichatContext} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

export const ADAPTIVE_AI_ENABLED_FLAG = 'adaptive-ai-enabled';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;
const TIMEOUT_MS = 30_000;

export const isAdaptiveAiEnabled = (): boolean =>
  !!DCDO.get(ADAPTIVE_AI_ENABLED_FLAG, false);

export interface GenerateOptions<T> {
  schema: z.ZodType<T>;
  prompt: string;
  /** The shell's own context, not the mounted chat's. */
  context: AichatContext;
}

/**
 * Output shaped by `schema` for `prompt`, or undefined when adaptive AI is
 * off, the call fails or times out, or the output does not fit the schema.
 */
export async function generate<T>({
  schema,
  prompt,
  context,
}: GenerateOptions<T>): Promise<T | undefined> {
  if (!isAdaptiveAiEnabled()) return undefined;
  try {
    const result = await withTimeout(
      generateText(
        {
          model: getModel(MODEL_ID),
          prompt,
          output: Output.object({schema}),
        },
        {phase: 'generation', aichatContext: context}
      ),
      TIMEOUT_MS
    );
    const parsed = schema.safeParse(result.output);
    if (!parsed.success) {
      report('Adaptive AI output did not fit its schema', parsed.error);
      return undefined;
    }
    return parsed.data;
  } catch (error) {
    report('Adaptive AI generation failed', error);
    return undefined;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function report(message: string, error: unknown) {
  Lab2Registry.getInstance()
    .getMetricsReporter()
    .logError(message, error instanceof Error ? error : undefined, {
      error: String(error),
    });
}
