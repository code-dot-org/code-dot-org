// The adaptive shell's one way to ask a model for something: structured
// output through the AI gateway, under its own client type, off until a DCDO
// flag opts in, and never an exception to the caller. Every feature built on
// it has a no-AI result it falls back to. Every call, however it ends, is
// traced to Langfuse under an id the caller gets back.

import {Output} from 'ai';
import {z} from 'zod';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AichatContext} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {
  TraceMetadata,
  TraceName,
  TraceUsage,
  startTrace,
} from './langfuse/trace';

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
  /** How the call is recorded in Langfuse. */
  trace: {name: TraceName; metadata: TraceMetadata};
}

export interface GenerateResult<T> {
  /** Generated output; undefined if Adaptive AI is disabled or if there was an error. */
  output?: T;
  /** The Langfuse trace id; absent only when Adaptive AI is disabled. */
  traceId?: string;
}

type GatewayResult = Awaited<ReturnType<typeof generateText>>;

export async function generate<T>({
  schema,
  prompt,
  context,
  trace: traceOptions,
}: GenerateOptions<T>): Promise<GenerateResult<T>> {
  if (!isAdaptiveAiEnabled()) return {};
  const trace = startTrace({
    name: traceOptions.name,
    levelId: context.currentLevelId,
    model: MODEL_ID,
    prompt,
    metadata: {
      ...traceOptions.metadata,
      scriptId: context.scriptId ?? undefined,
    },
  });
  const {traceId} = trace;

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
      trace.end({
        outcome: 'schema_mismatch',
        output: result.output,
        usage: getUsage(result),
        errorMessage: parsed.error.message,
        responseId: result.response?.id,
      });
      return {traceId};
    }
    trace.end({
      outcome: 'success',
      output: parsed.data,
      usage: getUsage(result),
      responseId: result.response?.id,
    });
    return {output: parsed.data, traceId};
  } catch (error) {
    report('Adaptive AI generation failed', error);
    trace.end({outcome: 'error', errorMessage: errorMessage(error)});
    return {traceId};
  }
}

function getUsage(result: GatewayResult): TraceUsage | undefined {
  const usage = result.usage;
  if (!usage) return undefined;
  return {
    input: usage.inputTokens,
    output: usage.outputTokens,
    total: usage.totalTokens,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
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
