// Logging for every AI Gateway call the AI Lessons surface makes.
//
// Two sinks share one tap: the browser console (dev convenience — each
// call logs a collapsed request group and a matching response group),
// and an in-memory event store the AI-log dialog subscribes to so demo
// users can peek at the traffic in the UI.  All aiLessons call sites
// route through loggedGenerateText instead of calling the gateway
// directly; StudentPage records step markers so the dialog can group
// calls by the step the student was on.

import {generateText} from '@cdo/apps/aiGateway';

type GenerateTextArgs = Parameters<typeof generateText>[0];
type GenerateTextResponse = Awaited<ReturnType<typeof generateText>>;

// ---- The in-memory event store ----

export type AiLogStatus = 'pending' | 'success' | 'error';

export interface AiLogCall {
  kind: 'call';
  id: number;
  // The agent label call sites pass ('build partner', 'tutor reply'…).
  label: string;
  model: string;
  temperature?: number;
  system?: string;
  prompt?: string;
  status: AiLogStatus;
  startedAt: number;
  durationMs?: number;
  // Structured output pretty-printed, else the plain response text.
  response?: string;
  error?: string;
}

export interface AiLogStepMarker {
  kind: 'step';
  id: number;
  title: string;
  at: number;
}

export type AiLogRow = AiLogCall | AiLogStepMarker;

const MAX_LOG_ROWS = 300;
const rows: AiLogRow[] = [];
const listeners = new Set<() => void>();
let nextRowId = 1;
// Stable snapshot for subscribers: a new array identity per change, so
// React re-renders; entries themselves are updated in place.
let snapshot: AiLogRow[] = [];

function notifyAiLog() {
  while (rows.length > MAX_LOG_ROWS) rows.shift();
  snapshot = [...rows];
  listeners.forEach(l => l());
}

export function subscribeAiLog(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAiLogRows(): AiLogRow[] {
  return snapshot;
}

// Marks the student's arrival on a step, so the dialog can separate
// calls by step.  Consecutive duplicates (remounts, resume) collapse.
export function recordStepMarker(title: string) {
  const last = rows[rows.length - 1];
  if (last?.kind === 'step' && last.title === title) return;
  rows.push({kind: 'step', id: nextRowId++, title, at: Date.now()});
  notifyAiLog();
}

function modelLabel(model: GenerateTextArgs['model']): string {
  if (typeof model === 'string') return model;
  return (model as {modelId?: string})?.modelId || String(model);
}

// The compiled JSON schema the structured-output constraint sends over
// the wire.  Mirrors the gateway's serializeOutputSchema: the SDK's
// Output object hides the compiled schema behind an internal Promise.
// This is where per-field instructions live (zod .describe() strings,
// e.g. the tutor's stay/advance/celebrate rules), so it's part of what
// the model reads and belongs in the log.
async function compiledOutputSchema(
  output: GenerateTextArgs['output']
): Promise<unknown> {
  if (!output) return undefined;
  try {
    const internal = output as unknown as {
      responseFormat?: Promise<{schema?: unknown}>;
    };
    if (internal.responseFormat) {
      const format = await internal.responseFormat;
      return format?.schema ?? output;
    }
  } catch {
    // Fall through to logging the raw object.
  }
  return output;
}

export async function loggedGenerateText(
  label: string,
  args: GenerateTextArgs
): Promise<GenerateTextResponse> {
  const startedAt = Date.now();
  const entry: AiLogCall = {
    kind: 'call',
    id: nextRowId++,
    label,
    model: modelLabel(args.model),
    temperature: args.temperature,
    system: typeof args.system === 'string' ? args.system : undefined,
    prompt: typeof args.prompt === 'string' ? args.prompt : undefined,
    status: 'pending',
    startedAt,
  };
  rows.push(entry);
  notifyAiLog();
  // Resolve the schema BEFORE opening the console group.  console.group
  // nesting is global state: an `await` between group open and close
  // lets a concurrent call (e.g. Check-my-work fires the tutor reply and
  // a progress summary together) open its group nested inside ours, and
  // logs end up buried in the wrong collapsed group.  Each group below
  // opens and closes synchronously.
  const outputSchema = args.output
    ? await compiledOutputSchema(args.output)
    : undefined;
  console.groupCollapsed(
    `%c[AI Lessons] ${label} → ${modelLabel(args.model)}`,
    'color: #7c4dff'
  );
  if (args.temperature !== undefined) {
    console.log('temperature:', args.temperature);
  }
  if (args.system) console.log(`system prompt:\n${args.system}`);
  if (typeof args.prompt === 'string') {
    console.log(`user prompt:\n${args.prompt}`);
  }
  if (outputSchema !== undefined) {
    console.log(
      'output schema (the response-format constraint; field descriptions are instructions the model reads):',
      outputSchema
    );
  }
  console.groupEnd();

  try {
    const response = await generateText(args);
    console.groupCollapsed(
      `%c[AI Lessons] ${label} ← response (${Date.now() - startedAt}ms)`,
      'color: #00897b'
    );
    if (response.output !== undefined) console.log('output:', response.output);
    if (response.text) console.log('text:', response.text);
    if (response.files?.length) {
      console.log(
        'files:',
        response.files.map(f => f.mediaType)
      );
    }
    if (response.usage) console.log('usage:', response.usage);
    console.groupEnd();
    entry.status = 'success';
    entry.durationMs = Date.now() - startedAt;
    entry.response =
      response.output !== undefined
        ? JSON.stringify(response.output, null, 2)
        : response.text;
    notifyAiLog();
    return response;
  } catch (e) {
    console.warn(
      `[AI Lessons] ${label} ✗ failed after ${Date.now() - startedAt}ms`,
      e
    );
    entry.status = 'error';
    entry.durationMs = Date.now() - startedAt;
    entry.error = e instanceof Error ? e.message : String(e);
    notifyAiLog();
    throw e;
  }
}
