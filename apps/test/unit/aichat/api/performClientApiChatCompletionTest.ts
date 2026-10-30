import {getClientApi} from '@cdo/apps/aichat/api/client';
import {createAichatRequest} from '@cdo/apps/aichat/api/client/helpers/aichatRequestHelpers';
import {performClientApiChatCompletion} from '@cdo/apps/aichat/api/performClientApiChatCompletion';
import {ModelParameters, PendingChatMessage} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatClientTypes,
  AiChatModelIds,
  AiInteractionStatus,
  AiRequestExecutionStatus,
} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aichat/api/client', () => ({
  getClientApi: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/api/client/helpers/aichatRequestHelpers', () => ({
  createAichatRequest: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getMetricsReporter: () => ({
        incrementCounter: jest.fn(),
        reportLoadTime: jest.fn(),
      }),
    }),
  },
}));

const mockGenerateChatResponse = jest.fn();

const newMessage: PendingChatMessage = {
  role: Role.USER,
  chatMessageText: 'Hello',
  status: AiInteractionStatus.UNKNOWN,
  timestamp: 1,
};

const modelParameters: ModelParameters = {
  selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
  temperature: 0.5,
  retrievalContexts: [],
  systemPrompt: 'system prompt',
};

const complete = () =>
  performClientApiChatCompletion(
    newMessage,
    [],
    modelParameters,
    {
      clientType: AiChatClientTypes.AI_TUTOR,
      currentLevelId: 7,
      scriptId: 2,
      channelId: 'channel-id',
    },
    () => 'asset-url'
  );

describe('performClientApiChatCompletion', () => {
  beforeEach(() => {
    (createAichatRequest as jest.Mock).mockResolvedValue(42);
    (getClientApi as jest.Mock).mockResolvedValue({
      generateChatResponse: mockGenerateChatResponse,
    });
  });

  it.each([
    AiRequestExecutionStatus.MODEL_PROFANITY,
    AiRequestExecutionStatus.MODEL_IMAGE_FLAGGED,
    AiRequestExecutionStatus.MODEL_CONTENT_FILTERED,
  ])(
    'marks a model response blocked with status %s as flagged',
    async status => {
      mockGenerateChatResponse.mockResolvedValue({
        response: 'Blocked reason: PROHIBITED_CONTENT.',
        status,
      });

      const [user, assistant] = await complete();

      expect(user.status).toBe(AiInteractionStatus.ERROR);
      expect(assistant.status).toBe(AiInteractionStatus.PROFANITY_VIOLATION);
      expect(assistant.chatMessageText).toBe(
        'Blocked reason: PROHIBITED_CONTENT.'
      );
    }
  );

  it('throws on a status it has no display for', async () => {
    mockGenerateChatResponse.mockResolvedValue({
      response: 'Unexpected finish reason: length',
      status: AiRequestExecutionStatus.FAILURE,
    });

    await expect(complete()).rejects.toThrow('invalid status');
  });
});
