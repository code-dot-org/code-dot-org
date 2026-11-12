// The adaptive shell's one way to ask a model for something: structured
// output through the AI gateway, under its own client type, off until a DCDO
// flag opts in, and never an exception to the caller. Every feature built on
// it has a no-AI result it falls back to. Every call, however it ends, is
// traced to Langfuse under an id the caller gets back. Beside it, the check
// that text may pass between a student and a model: what the student wrote
// going in, and what the model wrote before the student reads it.

import * as Observability from '@code-dot-org/core/plugins/observability';
import {Output} from 'ai';
import {z} from 'zod';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {
  isTextSafe,
  type TextSafetyTimeout,
} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import {AichatContext} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import {ValueOf} from '@cdo/apps/types/utils';
import {timeoutMsFromDcdoSeconds} from '@cdo/apps/util/dcdoTimeout';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {
  countAdaptive,
  reportAdaptiveError,
  timeAdaptive,
} from '../observability';

import {
  TraceMetadata,
  TraceName,
  TraceUsage,
  startTrace,
} from './langfuse/trace';
import {ADAPTIVE_MODELS} from './models';

export const ADAPTIVE_AI_ENABLED_FLAG = 'adaptive-ai-enabled';
const ADAPTIVE_AI_TIMEOUT_FLAG = 'adaptive-ai-timeout-seconds';

const DEFAULT_TIMEOUT_SECONDS = 45;
const SAFETY_CONFIG = {modelId: ADAPTIVE_MODELS.FAST};

export const isAdaptiveAiEnabled = (): boolean =>
  !!DCDO.get(ADAPTIVE_AI_ENABLED_FLAG, false);

// How long one model call may take, generation or moderation alike. The
// challenge before the call is not counted, so a slow one cannot use up the
// time meant for the model.
const requestTimeout = (): Required<TextSafetyTimeout> => ({
  timeoutMs: timeoutMsFromDcdoSeconds(
    ADAPTIVE_AI_TIMEOUT_FLAG,
    DEFAULT_TIMEOUT_SECONDS
  ),
  excludeChallengeFromTimeout: true,
});

export interface GenerateOptions<T> {
  schema: z.ZodType<T>;
  model: ValueOf<typeof AiChatModelIds>;
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

// Finer than the Langfuse outcome, which Rails allowlists: a timeout is its own.
type GenerationOutcome = 'success' | 'schema_mismatch' | 'timeout' | 'error';

// Only failures the gateway cannot see; it raises its own in Sentry.
const GENERATION_FAILURES: Record<'schema_mismatch' | 'timeout', string> = {
  schema_mismatch: 'Adaptive AI output did not fit its schema',
  timeout: 'Adaptive AI generation timed out',
};

export async function generate<T>({
  schema,
  model,
  prompt,
  context,
  trace: traceOptions,
}: GenerateOptions<T>): Promise<GenerateResult<T>> {
  if (!isAdaptiveAiEnabled()) return {};
  const trace = startTrace({
    name: traceOptions.name,
    levelId: context.currentLevelId,
    model,
    prompt,
    metadata: {
      ...traceOptions.metadata,
      scriptId: context.scriptId ?? undefined,
    },
  });
  const {traceId} = trace;
  const startedAt = Date.now();
  const record = (outcome: GenerationOutcome, error?: unknown) => {
    const dimensions = {
      Trace: traceOptions.name,
      ModelId: model,
      Outcome: outcome,
    };
    countAdaptive('Adaptive.AiGeneration', dimensions);
    timeAdaptive(
      'Adaptive.AiGenerationTime',
      Date.now() - startedAt,
      dimensions
    );
    if (outcome === 'success' || outcome === 'error') return;
    reportAdaptiveError(GENERATION_FAILURES[outcome], error, {
      traceId,
      trace: traceOptions.name,
      model,
      stepId: traceOptions.metadata.stepId,
    });
  };

  try {
    const {timeoutMs, excludeChallengeFromTimeout} = requestTimeout();
    const result = await generateText(
      {
        model: getModel(model),
        prompt,
        output: Output.object({schema}),
        timeout: timeoutMs,
      },
      {phase: 'generation', aichatContext: context, excludeChallengeFromTimeout}
    );
    const parsed = schema.safeParse(result.output);
    if (!parsed.success) {
      record('schema_mismatch', parsed.error);
      trace.end({
        outcome: 'schema_mismatch',
        output: result.output,
        usage: getUsage(result),
        errorMessage: parsed.error.message,
        responseId: result.response?.id,
      });
      return {traceId};
    }
    record('success');
    trace.end({
      outcome: 'success',
      output: parsed.data,
      usage: getUsage(result),
      responseId: result.response?.id,
    });
    return {output: parsed.data, traceId};
  } catch (error) {
    record(isTimeout(error) ? 'timeout' : 'error', error);
    trace.end({outcome: 'error', errorMessage: errorMessage(error)});
    return {traceId};
  }
}

export type ModerationResult = 'ok' | 'flagged' | 'error';
type ModerationPhase = 'input_filter' | 'output_filter';

/**
 * Moderates the given text, with a timeout for the given phase (input or output).
 */
async function moderate(
  text: string,
  phase: ModerationPhase,
  context: AichatContext
): Promise<ModerationResult> {
  let result: ModerationResult;
  try {
    const safe = await isTextSafe(
      text,
      phase,
      SAFETY_CONFIG,
      context,
      requestTimeout()
    );
    result = safe ? 'ok' : 'flagged';
  } catch (error) {
    reportAdaptiveError(`Adaptive ${phase} moderation failed`, error, {phase});
    result = 'error';
  }
  Observability.metrics.count('adaptive.text_moderation', 1, {phase, result});
  return result;
}

export const moderateInput = (text: string, context: AichatContext) =>
  moderate(text, 'input_filter', context);

export const moderateOutput = (text: string, context: AichatContext) =>
  moderate(text, 'output_filter', context);

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

// The gateway rejects a timeout as the AI SDK does, with a DOMException.
const isTimeout = (error: unknown) =>
  error instanceof Object &&
  (error as {name?: unknown}).name === 'TimeoutError';
