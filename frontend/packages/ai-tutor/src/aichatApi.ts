/**
 * Polling-based aichat completion client. Ports the essential subset of
 * `apps/src/aichat/aichatApi.ts` — the start-then-poll pattern the legacy
 * AI Tutor uses to survive long completions.
 *
 * Why polling instead of a single fetch: backend completions routinely run
 * 10–60s. A direct HTTP request would hit edge/proxy timeouts and fail. The
 * Rails completion endpoint instead returns immediately with a `requestId`
 * and polling interval; the client polls a status endpoint until the
 * `executionStatus` crosses `SUCCESS` (or until the client-side timeout).
 *
 * The on-the-wire shape and endpoint paths match the legacy verbatim so
 * the existing `/aichat_request/*` controller serves both clients.
 */

const ROOT_REQUEST_URL = '/aichat_request';
const START_CHAT_COMPLETION_URL = `${ROOT_REQUEST_URL}/start_chat_completion`;
const GET_CHAT_REQUEST_URL = `${ROOT_REQUEST_URL}/chat_request`;

const MIN_POLLING_INTERVAL_MS = 1000;
const DEFAULT_BACKOFF_RATE = 1;
const DEFAULT_MAX_POLLING_TIME_MS = 120_000;

/**
 * Status codes returned by the aichat backend. Mirrors
 * `apps/generated-scripts/sharedConstants.ts`'s `AiRequestExecutionStatus`.
 *
 * `SUCCESS` and above mean the request is done (success or terminal error).
 * `RUNNING` and below mean keep polling.
 */
export const AiRequestExecutionStatus = {
  NOT_STARTED: 0,
  QUEUED: 1,
  RUNNING: 2,
  SUCCESS: 3,
  FAILURE: 1000,
  USER_PROFANITY: 1001,
  USER_PII: 1002,
  MODEL_PROFANITY: 1003,
} as const;

export type AiRequestExecutionStatusValue =
  (typeof AiRequestExecutionStatus)[keyof typeof AiRequestExecutionStatus];

export interface AichatChatMessage {
  /** 'user' or 'assistant'. */
  role: 'user' | 'assistant';
  /** The visible message text. */
  chatMessageText: string;
  /**
   * Optional hidden context appended for the model only; never stored or
   * shown back to the student.
   */
  hiddenContext?: string;
  /** Unix-ms timestamp. */
  timestamp: number;
}

export interface AichatModelParameters {
  /** System prompt for the tutor model. */
  systemPrompt?: string;
  /** Sampling temperature. */
  temperature?: number;
  /** Model id known to the gateway / backend. */
  modelId: string;
}

export interface AichatContext {
  /** Which client is making the request — controls system-prompt defaults. */
  clientType: string;
  levelId?: number;
  channelId?: string;
}

interface StartChatCompletionResponse {
  requestId: number;
  pollingIntervalMs: number;
  backoffRate?: number;
}

interface GetChatRequestResponse {
  executionStatus: AiRequestExecutionStatusValue;
  response: string;
}

export interface PostAichatCompletionMessageOptions {
  /** Override the maximum time (ms) to keep polling before giving up. */
  maxPollingTimeMs?: number;
  /** Optional abort signal. Aborts the in-flight HTTP request only. */
  signal?: AbortSignal;
}

export interface AichatCompletionResult {
  /** Assistant's reply text. Empty string if the model declined to answer. */
  text: string;
  /** Final execution status — `SUCCESS` or one of the terminal error codes. */
  executionStatus: AiRequestExecutionStatusValue;
  /** The backend's request id. Useful for logging / feedback. */
  requestId: number;
}

/**
 * Start a chat completion request and poll until it's done. Returns the
 * assistant's reply text plus the final status + request id.
 *
 * Errors out if the request never completes within the timeout.
 */
export async function postAichatCompletionMessage(
  newMessage: AichatChatMessage,
  storedMessages: AichatChatMessage[],
  modelParameters: AichatModelParameters,
  aichatContext: AichatContext,
  options: PostAichatCompletionMessageOptions = {},
): Promise<AichatCompletionResult> {
  const {maxPollingTimeMs = DEFAULT_MAX_POLLING_TIME_MS, signal} = options;

  const startResponse = await fetch(START_CHAT_COMPLETION_URL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {'Content-Type': 'application/json; charset=UTF-8'},
    body: JSON.stringify({
      newMessage,
      storedMessages,
      modelParameters,
      aichatContext,
    }),
    signal,
  });

  if (!startResponse.ok) {
    throw new Error(
      `start_chat_completion failed (${startResponse.status})`,
    );
  }

  const {
    requestId,
    pollingIntervalMs,
    backoffRate: serverBackoffRate,
  } = (await startResponse.json()) as StartChatCompletionResponse;

  const startTime = Date.now();
  const backoffRate = serverBackoffRate ?? DEFAULT_BACKOFF_RATE;

  let executionStatus: AiRequestExecutionStatusValue =
    AiRequestExecutionStatus.NOT_STARTED;
  let currentInterval = Math.max(pollingIntervalMs, MIN_POLLING_INTERVAL_MS);
  let modelResponse = '';

  // Keep polling until the request crosses SUCCESS (or hits any of the
  // terminal failure statuses — those are all >= SUCCESS as well) or until
  // we run out of time.
  while (
    executionStatus < AiRequestExecutionStatus.SUCCESS &&
    Date.now() - startTime < maxPollingTimeMs
  ) {
    await new Promise(resolve => setTimeout(resolve, currentInterval));

    const pollResponse = await fetch(
      `${GET_CHAT_REQUEST_URL}/${requestId}`,
      {credentials: 'same-origin', signal},
    );
    if (!pollResponse.ok) {
      throw new Error(`chat_request poll failed (${pollResponse.status})`);
    }
    const {executionStatus: status, response} =
      (await pollResponse.json()) as GetChatRequestResponse;
    executionStatus = status;
    modelResponse = response;
    currentInterval *= backoffRate;
  }

  if (executionStatus < AiRequestExecutionStatus.SUCCESS) {
    throw new Error('Chat completion request timed out (client side)');
  }

  return {
    text: modelResponse ?? '',
    executionStatus,
    requestId,
  };
}

export {START_CHAT_COMPLETION_URL, GET_CHAT_REQUEST_URL};
