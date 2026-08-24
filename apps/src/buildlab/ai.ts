import HttpClient from '@cdo/apps/util/HttpClient';

const FLOW_LAB_CLIENT_TYPE = 'flow-lab';
const DEFAULT_MODEL_ID = 'gemini-2.5-flash';
const SUCCESS_STATUS = 3;
const MIN_POLLING_INTERVAL_MS = 1000;
const MAX_POLLING_INTERVAL_MS = 5000;
const MAX_POLLING_TIME_MS = 90_000;

interface StartChatCompletionResponse {
  backoffRate?: number;
  pollingIntervalMs?: number;
  requestId: number;
}

interface ChatRequestResponse {
  executionStatus: number;
  response?: string;
}

interface AiRequest {
  body?: unknown;
  method: 'GET' | 'POST';
  url: string;
}

interface AiTransport {
  request<T>(request: AiRequest): Promise<T>;
}

const dashboardTransport: AiTransport = {
  async request<T>({body, method, url}: AiRequest): Promise<T> {
    const response =
      method === 'POST'
        ? await HttpClient.post(url, JSON.stringify(body), true, {
            'Content-Type': 'application/json; charset=UTF-8',
          })
        : await HttpClient.get(url);

    return (await response.json()) as T;
  },
};

function wait(milliseconds: number) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

function statusMessage(status: number) {
  switch (status) {
    case 1001:
      return 'The prompt was blocked by the safety filter.';
    case 1002:
      return 'The prompt contained personal information.';
    case 1003:
    case 1004:
      return 'The AI response was blocked by the safety filter.';
    case 1006:
      return 'The AI request timed out.';
    case 1008:
      return 'The AI service is busy. Try again in a moment.';
    default:
      return 'The AI request failed.';
  }
}

export async function generateBuildLabText(
  prompt: string,
  channelId?: string,
  transport: AiTransport = dashboardTransport
): Promise<string> {
  const normalizedPrompt = prompt.trim();
  if (!normalizedPrompt) {
    throw new Error('Add a prompt for the AI block.');
  }

  const {requestId, pollingIntervalMs, backoffRate} =
    await transport.request<StartChatCompletionResponse>({
      body: {
        aichatContext: {
          channelId,
          clientType: FLOW_LAB_CLIENT_TYPE,
          currentLevelId: null,
          scriptId: null,
        },
        modelParameters: {
          retrievalContexts: [],
          selectedModelId: DEFAULT_MODEL_ID,
          systemPrompt: '',
          temperature: 0.5,
        },
        newMessage: {
          chatMessageText: normalizedPrompt,
          role: 'user',
          status: 'unknown',
          timestamp: Date.now(),
        },
        storedMessages: [],
      },
      method: 'POST',
      url: '/aichat_request/start_chat_completion',
    });

  if (!requestId) {
    throw new Error('The AI request did not start.');
  }

  const startedAt = Date.now();
  let pollingInterval = Math.max(
    MIN_POLLING_INTERVAL_MS,
    pollingIntervalMs ?? MIN_POLLING_INTERVAL_MS
  );
  const retryRate =
    Number.isFinite(backoffRate) && backoffRate! > 1 ? backoffRate! : 1;

  while (Date.now() - startedAt < MAX_POLLING_TIME_MS) {
    await wait(pollingInterval);
    const result = await transport.request<ChatRequestResponse>({
      method: 'GET',
      url: `/aichat_request/chat_request/${requestId}`,
    });

    if (result.executionStatus >= SUCCESS_STATUS) {
      if (result.executionStatus !== SUCCESS_STATUS) {
        throw new Error(statusMessage(result.executionStatus));
      }

      const response = result.response?.trim();
      if (!response) {
        throw new Error('The AI did not return any text.');
      }
      return response;
    }

    pollingInterval = Math.min(
      MAX_POLLING_INTERVAL_MS,
      Math.ceil(pollingInterval * retryRate)
    );
  }

  throw new Error('The AI request timed out.');
}
