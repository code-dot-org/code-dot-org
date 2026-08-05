// Console logging for every AI Gateway call the AI Lessons surface makes.
//
// Dev convenience: each call logs a collapsed request group (model,
// temperature, full system prompt, full user prompt) and a matching
// response group (structured output / text / usage, plus wall time), so
// what goes to and from the LLM is verifiable in the browser console.
// All aiLessons call sites route through loggedGenerateText instead of
// calling the gateway directly.

import {generateText} from '@cdo/apps/aiGateway';

type GenerateTextArgs = Parameters<typeof generateText>[0];
type GenerateTextResponse = Awaited<ReturnType<typeof generateText>>;

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
    return response;
  } catch (e) {
    console.warn(
      `[AI Lessons] ${label} ✗ failed after ${Date.now() - startedAt}ms`,
      e
    );
    throw e;
  }
}
