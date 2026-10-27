import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {AichatContext} from '@cdo/apps/aichat/types';
import {fetchAccessToken} from '@cdo/apps/aiGateway/shared';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn()},
}));

const mockPost = HttpClient.post as jest.Mock;

const tutorContext: AichatContext = {
  clientType: AiChatClientTypes.AI_TUTOR,
  currentLevelId: 1,
  scriptId: null,
  channelId: undefined,
};

describe('fetchAccessToken', () => {
  beforeEach(() => {
    mockPost.mockResolvedValue({
      json: async () => ({token: 'jwt', turnstileEnforcementMode: 'disabled'}),
    });
    AichatContextManager.setContext(tutorContext);
  });

  it('sends the chat workspace context by default', async () => {
    const result = await fetchAccessToken();

    expect(JSON.parse(mockPost.mock.calls[0][1])).toEqual({
      aichatContext: tutorContext,
    });
    expect(result).toEqual({
      token: 'jwt',
      turnstileEnforcementMode: 'disabled',
    });
  });

  it('sends the given context instead when a caller passes one', async () => {
    const shellContext: AichatContext = {
      clientType: AiChatClientTypes.ADAPTIVE,
      currentLevelId: 7,
      scriptId: 2,
      channelId: undefined,
    };

    await fetchAccessToken(shellContext);

    expect(JSON.parse(mockPost.mock.calls[0][1])).toEqual({
      aichatContext: shellContext,
    });
  });
});
