// The provider half of the dev proxy, as pure functions.
//
// Separated from the Vite plugin so it can be tested without a server: the
// plugin is plumbing, and this is the part with decisions in it — how a
// conversation becomes a request, how a JSON schema becomes a tool, and which
// HTTP failures the panel already has words for.
//
// DEV ONLY, and none of the production safety is here. The dashboard path runs
// input profanity classification, output image moderation and Turnstile
// (`generateChatResponse`, `aiGateway/turnstile`); this runs a developer's own
// key against a developer's own prompt and asserts nothing about either
// (specs/PLAN.md §7).

import {AiInteractionStatus} from '../model/status';

import type {ProxyReply, ProxyRequest} from './protocol';

export const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
export const ANTHROPIC_VERSION = '2023-06-01';

/**
 * The model a dev proxy uses when nobody says.
 *
 * Overridable with `TUTOR_MODEL`, because the right answer depends on what is
 * being tried: a latest-generation model for ordinary work, and a larger one
 * when the thing under test is whether the tutor can reason about a project at
 * all.
 */
export const DEFAULT_MODEL = 'claude-sonnet-5';

/**
 * Room for an explanation AND the files it rewrote.
 *
 * The schema asks the model to "provide the entire contents of the file", so a
 * single answer can carry a whole page of HTML plus its stylesheet. At 4096
 * this truncated silently and often: the reply comes back `stop_reason:
 * max_tokens` with a tool call whose JSON stops mid-object, so there is no
 * answer to read and the panel had nothing to show. Overridable for a model
 * whose ceiling is lower.
 */
const MAX_TOKENS = Number(process.env.TUTOR_MAX_TOKENS ?? 16384);

/**
 * The one tool, when the request wants structured output.
 *
 * A tool rather than "reply with JSON, please": the schema is enforced by the
 * provider, so a malformed proposal is impossible rather than merely unlikely,
 * and there is no fenced block to strip before parsing.
 */
const TOOL_NAME = 'respond';

export const anthropicBody = (request: ProxyRequest, model: string): object => {
  const body: Record<string, unknown> = {
    model,
    max_tokens: MAX_TOKENS,
    messages: request.messages.map(message => ({
      role: message.role,
      content: message.text,
    })),
  };
  if (request.system) {
    body.system = request.system;
  }
  if (request.responseSchema) {
    body.tools = [
      {
        name: TOOL_NAME,
        description: 'Answer the student in the required shape.',
        input_schema: request.responseSchema,
      },
    ];
    // Not merely offered — required, or the model may answer in prose and the
    // caller gets nothing where it expected a proposal.
    body.tool_choice = {type: 'tool', name: TOOL_NAME};
  }
  return body;
};

interface AnthropicBlock {
  type: string;
  text?: string;
  name?: string;
  input?: unknown;
}

/** Pull the answer out of whatever mixture of blocks came back. */
export const anthropicReply = (payload: {
  content?: AnthropicBlock[];
  stop_reason?: string;
}): ProxyReply => {
  const blocks = payload.content ?? [];

  // RAN OUT OF ROOM. The model was still writing — a tool call whose JSON
  // stops mid-object parses to something missing the fields the caller needs,
  // and the turn reads as empty rather than as broken. Named here, where the
  // stop reason is visible, so the panel can say the answer was too long
  // instead of showing nothing.
  if (payload.stop_reason === 'max_tokens') {
    return {
      text: '',
      failure: AiInteractionStatus.USER_INPUT_TOO_LARGE,
      detail:
        `the model hit max_tokens (${MAX_TOKENS}) and its answer was cut off. ` +
        'Raise TUTOR_MAX_TOKENS, or ask for a smaller change.',
    };
  }
  const text = blocks
    .filter(block => block.type === 'text' && block.text)
    .map(block => block.text)
    .join('\n')
    .trim();
  const tool = blocks.find(
    block => block.type === 'tool_use' && block.name === TOOL_NAME,
  );
  return tool ? {text, structured: tool.input} : {text};
};

/**
 * Which failure a provider's HTTP status is, in this package's vocabulary.
 *
 * Mapped here, in the half that can see the status code, so that the browser is
 * not re-deriving "was that a rate limit" from a message string. Everything
 * unrecognised is `ERROR`, which is the copy of last resort and says only that
 * it did not work.
 */
export const failureFor = (status: number): string => {
  if (status === 429) {
    return AiInteractionStatus.MODEL_RATE_LIMITED;
  }
  if (status === 408 || status === 504) {
    return AiInteractionStatus.MODEL_TIMEOUT;
  }
  if (status === 413) {
    return AiInteractionStatus.USER_INPUT_TOO_LARGE;
  }
  return AiInteractionStatus.ERROR;
};

/** Ask the provider. Rejects only when the request could not be made. */
export const askAnthropic = async (
  request: ProxyRequest,
  apiKey: string,
  model: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ProxyReply> => {
  const response = await fetchImpl(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(anthropicBody(request, model)),
  });

  if (process.env.TUTOR_DEBUG) {
    // Before anything is interpreted, because interpreting it is where this
    // goes wrong: a model that answers in a block shape `anthropicReply` does
    // not read produces an empty turn and no clue as to what it actually said.
    const clone =
      typeof response.clone === 'function' ? response.clone() : undefined;
    void clone?.text().then(body => {
      console.info(`[tutor] ${response.status} ${body.slice(0, 4000)}`);
    });
  }

  if (!response.ok) {
    // The body is where the provider says WHY — an invalid key, a model this
    // account cannot reach, a malformed request. Carried back for the
    // developer's terminal (`dev/keyProxy`), not for the panel.
    let detail = `${response.status}`;
    try {
      const body = await response.text();
      detail = `${response.status} ${body}`.trim();
    } catch {
      // A body that cannot be read is not a reason to lose the turn. The
      // status alone still names the failure, and a refused request must
      // resolve however odd the response is.
    }
    return {text: '', failure: failureFor(response.status), detail};
  }
  return anthropicReply(await response.json());
};
