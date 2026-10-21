// One adaptive generation's Langfuse trace, relayed through Rails. The
// browser is the only party that sees the whole gateway call, so it reports
// the outcome; Rails supplies the user and bounds the payload. The id is
// minted here so the caller has it before the relay answers, and posting
// never blocks or fails the caller.

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import HttpClient from '@cdo/apps/util/HttpClient';

const TRACE_URL = '/adaptive/traces';
const MAX_ERROR_MESSAGE_LENGTH = 1_000;

/** Trace names Rails accepts; each is one kind of shell generation. */
export type TraceName = 'adaptive-instructions';

export type TraceOutcome = 'success' | 'schema_mismatch' | 'error';

/** Flat context Rails allowlists onto the trace, such as pathway and step ids. */
export type TraceMetadata = {
  [key: string]: string | number | boolean | undefined;
};

export interface TraceUsage {
  input?: number;
  output?: number;
  total?: number;
}

export interface TraceStart {
  name: TraceName;
  /** The adaptive level, which Rails checks access against. */
  levelId: number | null;
  model: string;
  prompt: string;
  metadata: TraceMetadata;
}

export interface TraceEnd {
  outcome: TraceOutcome;
  /** The parsed output, or the ill-fitting raw output on a schema mismatch. */
  output?: unknown;
  usage?: TraceUsage;
  errorMessage?: string;
  /** The gateway's response id, for finding the call in its logs. */
  responseId?: string;
}

export interface Trace {
  /** 32 hex characters. */
  traceId: string;
  /** Relays the call's outcome. Fire-and-forget. */
  end(details: TraceEnd): void;
}

interface TracePayload extends Omit<TraceEnd, 'responseId'> {
  traceId: string;
  traceName: TraceName;
  levelId: number | null;
  model: string;
  prompt: string;
  /** Epoch milliseconds. */
  startedAt: number;
  endedAt: number;
  metadata: TraceMetadata;
}

/** Starts timing a generation under a fresh trace id. */
export function startTrace(start: TraceStart): Trace {
  const traceId = newTraceId();
  const startedAt = Date.now();
  return {
    traceId,
    end: ({outcome, output, usage, errorMessage, responseId}) => {
      void postTrace({
        traceId,
        traceName: start.name,
        levelId: start.levelId,
        model: start.model,
        prompt: start.prompt,
        output,
        outcome,
        usage,
        errorMessage: errorMessage?.slice(0, MAX_ERROR_MESSAGE_LENGTH),
        startedAt,
        endedAt: Date.now(),
        metadata: {...start.metadata, responseId},
      });
    },
  };
}

// Not crypto.randomUUID: jsdom lacks it, so the unit tests would have to mock it.
function newTraceId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

// A failed post is reported, never thrown.
async function postTrace(payload: TracePayload): Promise<void> {
  try {
    await HttpClient.post(TRACE_URL, JSON.stringify(payload), true, {
      'Content-Type': 'application/json',
    });
  } catch (error) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError(
        'Adaptive trace post failed',
        error instanceof Error ? error : undefined,
        {error: String(error)}
      );
  }
}
