import {
  GetChatRequestResponse,
  postAichatCompletionMessage,
} from '@cdo/apps/aichat/aichatApi';
import {
  AichatContext,
  AichatModelCustomizations,
  AiCustomizations,
  ChatMessage,
} from '@cdo/apps/aichat/types';
import {EMPTY_MODEL_CARD_INFO} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {ValueOf} from '@cdo/apps/types/utils';
import {
  default as HttpClient,
  type GetResponse,
} from '@cdo/apps/util/HttpClient';
import {
  AiChatModelIds,
  AiInteractionStatus,
  AiRequestExecutionStatus,
} from '@cdo/generated-scripts/sharedConstants';

describe('aichatApi', () => {
  let chatMessage: ChatMessage,
    storedMessages: ChatMessage[],
    aiCustomizations: AiCustomizations,
    aichatModelCustomizations: AichatModelCustomizations,
    aichatContext: AichatContext,
    post: jest.MockedFunction<typeof HttpClient.post>,
    fetchJson: jest.MockedFunction<typeof HttpClient.fetchJson>;

  beforeEach(() => {
    chatMessage = {
      chatMessageText: 'hello',
      role: Role.USER,
      status: AiInteractionStatus.OK,
      timestamp: Date.now(),
    };
    storedMessages = [
      {
        chatMessageText: 'how are you?',
        role: Role.USER,
        status: AiInteractionStatus.OK,
        timestamp: Date.now(),
      },
      {
        chatMessageText: 'great thank you',
        role: Role.ASSISTANT,
        status: AiInteractionStatus.OK,
        timestamp: Date.now(),
      },
    ];
    aiCustomizations = {
      selectedModelId: AiChatModelIds.ARITHMO,
      temperature: 0.5,
      retrievalContexts: ['123'],
      systemPrompt: 'hello',
      modelCardInfo: EMPTY_MODEL_CARD_INFO,
    };

    aichatModelCustomizations = {
      selectedModelId: aiCustomizations.selectedModelId,
      temperature: aiCustomizations.temperature,
      retrievalContexts: aiCustomizations.retrievalContexts,
      systemPrompt: aiCustomizations.systemPrompt,
    };

    aichatContext = {
      currentLevelId: 123,
      scriptId: 321,
      channelId: 'abc123',
    };

    post = jest.fn();
    fetchJson = jest.fn();

    HttpClient.fetchJson = fetchJson;
    HttpClient.post = post;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('async polling chat completion API', () => {
    let requestId: number,
      pollingIntervalMs: number,
      backoffRate: number,
      botResponse: string,
      successResponse: GetResponse<GetChatRequestResponse>,
      waitingResponse: GetResponse<GetChatRequestResponse>;

    beforeEach(() => {
      requestId = 123;
      pollingIntervalMs = 1000;
      backoffRate = 1.1;

      const response = new Response();
      response.json = jest.fn().mockResolvedValue({
        requestId,
        pollingIntervalMs,
        backoffRate,
      });

      post.mockResolvedValue(response);

      botResponse = 'hello how are you today?';
      successResponse = createResponse(
        AiRequestExecutionStatus.SUCCESS,
        botResponse
      );
      waitingResponse = createResponse(AiRequestExecutionStatus.RUNNING, '');
    });

    async function callApiGetMessages(maxPollingTime?: number) {
      return (
        await postAichatCompletionMessage(
          chatMessage,
          storedMessages,
          aiCustomizations,
          aichatContext,
          maxPollingTime
        )
      ).messages;
    }

    function createResponse(
      status: ValueOf<typeof AiRequestExecutionStatus>,
      response: string
    ) {
      return {
        value: {
          executionStatus: status,
          response: response,
        },
        response: new Response(),
      };
    }

    it('returns a user message and bot message if status is SUCCESS', async () => {
      fetchJson.mockResolvedValue(successResponse);

      const messages = await callApiGetMessages();

      // Verify start_chat_completion POST call
      expect(post).toHaveBeenCalledTimes(1);
      expect(post.mock.calls[0][0]).toMatch(/start_chat_completion/);
      expect(post.mock.calls[0][1]).toBe(
        JSON.stringify({
          newMessage: chatMessage,
          storedMessages,
          aichatModelCustomizations,
          aichatContext,
        })
      );

      expect(fetchJson.mock.calls[0][0].includes(requestId.toString())).toBe(
        true
      );
      expect(messages.length).toBe(2);
      expect(messages[0].status).toBe(AiInteractionStatus.OK);
      expect(messages[1].status).toBe(AiInteractionStatus.OK);
      expect(messages[1].chatMessageText).toBe(botResponse);
    });

    it('waits until the chat request finishes processing before returning messages', async () => {
      // Wait twice, then return success
      fetchJson
        .mockResolvedValueOnce(waitingResponse)
        .mockResolvedValueOnce(waitingResponse)
        .mockResolvedValue(successResponse);

      const startTime = Date.now();
      const messages = await callApiGetMessages();

      const runtime = Date.now() - startTime;
      // We expect the polling to have run 3 times, slightly increasing each time based off the backoff rate.
      const expectedRuntime =
        pollingIntervalMs +
        backoffRate * pollingIntervalMs +
        backoffRate * backoffRate * pollingIntervalMs;

      expect(runtime).toBeGreaterThanOrEqual(expectedRuntime);
      expect(fetchJson).toHaveBeenCalledTimes(3);
      expect(messages.length).toBe(2);
      expect(messages[0].status).toBe(AiInteractionStatus.OK);
      expect(messages[1].status).toBe(AiInteractionStatus.OK);
      expect(messages[1].chatMessageText).toBe(botResponse);
    });

    it('throws an error if the chat times out', async () => {
      fetchJson.mockResolvedValue(waitingResponse);

      await expect(callApiGetMessages(2000)).rejects.toThrow(
        'Chat completion request timed out'
      );
    });

    // Check all non-success user statuses
    (
      [
        ['USER_PROFANITY', AiInteractionStatus.PROFANITY_VIOLATION],
        ['USER_PII', AiInteractionStatus.PII_VIOLATION],
      ] as [keyof typeof AiRequestExecutionStatus, string][]
    ).forEach(([executionStatus, messageStatus]) => {
      it(`returns user message with ${messageStatus} status if status is ${executionStatus}`, async () => {
        fetchJson.mockResolvedValue(
          createResponse(AiRequestExecutionStatus[executionStatus], '')
        );
        const messages = await callApiGetMessages();
        expect(messages.length).toBe(1);
        expect(messages[0].status).toBe(messageStatus);
      });
    });

    (
      ['FAILURE', 'MODEL_PII'] as (keyof typeof AiRequestExecutionStatus)[]
    ).forEach(status => {
      it(`returns user and bot message with ERROR if status is ${status}`, async () => {
        const modelResponse = 'Error: something went wrong';
        fetchJson.mockResolvedValue(
          createResponse(AiRequestExecutionStatus[status], modelResponse)
        );
        const messages = await callApiGetMessages();
        expect(messages.length).toBe(2);
        expect(messages[0].status).toBe(AiInteractionStatus.ERROR);
        expect(messages[1].status).toBe(AiInteractionStatus.ERROR);
        expect(messages[1].chatMessageText).toBe(modelResponse);
      });
    });

    it('returns bot message with PROFANITY_VIOLATION if status is MODEL_PROFANITY', async () => {
      const modelResponse = 'Error: something went wrong';
      fetchJson.mockResolvedValue(
        createResponse(AiRequestExecutionStatus.MODEL_PROFANITY, modelResponse)
      );
      const messages = await callApiGetMessages();
      expect(messages.length).toBe(2);
      expect(messages[0].status).toBe(AiInteractionStatus.ERROR);
      expect(messages[1].status).toBe(AiInteractionStatus.PROFANITY_VIOLATION);
      expect(messages[1].chatMessageText).toBe(modelResponse);
    });

    it('throws an error if an unknown status is returned', async () => {
      const status = 123456 as ValueOf<typeof AiRequestExecutionStatus>;
      fetchJson.mockResolvedValue(createResponse(status, 'Unknown status'));

      expect(callApiGetMessages()).rejects.toThrow(
        `Unexpected status: ${status}`
      );
    });
  });
});
