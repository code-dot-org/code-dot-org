import {generateChatResponse} from '@cdo/apps/aichat/api/client/generateChatResponse';
import {
  AssetSource,
  ChatAsset,
  CompletedChatMessage,
  ModelParameters,
  PendingChatMessage,
} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {generateText} from '@cdo/apps/aiGateway';
import {
  AiChatModelIds,
  AiInteractionStatus,
} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aiGateway', () => ({
  generateText: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/api/client/helpers/safetyHelpers', () => ({
  isTextSafe: jest.fn().mockResolvedValue(true),
  isImageSafe: jest.fn(),
  getImageModerationStatus: jest.fn(),
  isOutputImageLlmSafetyJudgeEnabled: jest.fn(() => false),
}));

jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  getModel: jest.fn(() => 'test-model'),
}));

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  metrics: {count: jest.fn()},
  logger: {info: jest.fn()},
}));

jest.mock('@cdo/apps/lab2/utils', () => ({
  sendLab2AnalyticsEvent: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getMetricsReporter: () => ({logError: jest.fn(), logWarning: jest.fn()}),
    }),
  },
}));

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;

const modelParameters: ModelParameters = {
  selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
  temperature: 0.5,
  retrievalContexts: [],
  systemPrompt: 'system prompt',
};

const generatedImage: ChatAsset = {
  filename: 'generated-file-abc.png',
  source: AssetSource.PROJECT,
};

// An image-only assistant response: the model returned a picture and no text.
const imageOnlyHistoryMessage: CompletedChatMessage = {
  role: Role.ASSISTANT,
  status: AiInteractionStatus.OK,
  chatMessageText: '',
  timestamp: 1,
  requestId: 1,
  assets: [generatedImage],
};

const newMessage: PendingChatMessage = {
  role: Role.USER,
  status: AiInteractionStatus.UNKNOWN,
  chatMessageText: 'make it cuter',
  timestamp: 2,
};

const buildAssetUrl = (asset: ChatAsset) =>
  `/v3/assets/channel-id/${asset.filename}`;

describe('generateChatResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateText.mockResolvedValue({
      text: 'here you go',
      files: [],
      finishReason: 'stop',
      response: {},
      output: undefined,
    } as unknown as Awaited<ReturnType<typeof generateText>>);
    // The asset lives in another project, as it does after a level change.
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Map(),
      arrayBuffer: async () => new ArrayBuffer(0),
    }) as unknown as typeof global.fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('leaves out a history message whose only content was an unreadable asset', async () => {
    await generateChatResponse(
      newMessage,
      [imageOnlyHistoryMessage],
      modelParameters,
      buildAssetUrl
    );

    const messages = mockGenerateText.mock.calls[0][0].messages ?? [];
    // Dropping just the asset would leave a message with no parts, which the
    // model rejects with "must include at least one parts field" -- the same
    // poisoned conversation, a different error.
    expect(
      messages.filter(m => m.role !== 'system' && m.content.length === 0)
    ).toEqual([]);
    expect(messages.filter(m => m.role === 'assistant')).toEqual([]);
    expect(messages.filter(m => m.role === 'user')).toHaveLength(1);
  });

  it('keeps a history message that still has text after its asset is dropped', async () => {
    await generateChatResponse(
      newMessage,
      [{...imageOnlyHistoryMessage, chatMessageText: 'here is a sloth'}],
      modelParameters,
      buildAssetUrl
    );

    const messages = mockGenerateText.mock.calls[0][0].messages ?? [];
    expect(messages.filter(m => m.role === 'assistant')).toEqual([
      {role: 'assistant', content: [{type: 'text', text: 'here is a sloth'}]},
    ]);
  });

  it('fails the request when the new message has nothing readable to send', async () => {
    await expect(
      generateChatResponse(
        {...newMessage, chatMessageText: '', assets: [generatedImage]},
        [],
        modelParameters,
        buildAssetUrl
      )
    ).rejects.toThrow();
    expect(mockGenerateText).not.toHaveBeenCalled();
  });
});
