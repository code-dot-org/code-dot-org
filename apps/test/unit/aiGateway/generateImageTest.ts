import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {
  CURRENT_SCHEMA_VERSION,
  generateImageRequestSchemas,
} from '@cdo/apps/aiGateway/contract/gatewaySchemas';
import generateImageThroughGateway from '@cdo/apps/aiGateway/generateImage';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  startSpan: jest.fn((_options, execute) => execute()),
  recordError: jest.fn(),
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn()},
}));

jest.mock('@cdo/apps/aiGateway/shared', () => ({
  ...jest.requireActual('@cdo/apps/aiGateway/shared'),
  fetchAccessToken: jest.fn(async () => ({
    token: 'jwt.token.here',
    turnstileEnforcementMode: 'disabled',
  })),
}));

jest.mock('@cdo/apps/aiGateway/turnstile', () => ({
  fetchTurnstileToken: jest.fn(async () => undefined),
  turnstileHeaders: () => ({}),
  turnstileErrorTags: () => ({}),
}));

const mockReportGatewayError = jest.fn();
jest.mock('@cdo/apps/aiGateway/logHelper', () => ({
  reportGatewayError: (...args: unknown[]) => mockReportGatewayError(...args),
}));

const mockPost = HttpClient.post as jest.Mock;

// One PNG pixel's worth of bytes, base64: enough to prove decoding happened.
const RESPONSE_BODY = {
  images: [{base64: 'AQID', mediaType: 'image/png'}],
  warnings: [],
  usage: {inputTokens: 5, outputTokens: 0, totalTokens: 5},
};

function respondWith(body: unknown) {
  mockPost.mockResolvedValue({json: async () => body});
}

function sentBody(): Record<string, unknown> {
  return JSON.parse(mockPost.mock.calls[0][1] as string);
}

describe('generateImageThroughGateway', () => {
  beforeAll(() => {
    // The client tags its span with the client type, which lives here.
    AichatContextManager.setContext({
      clientType: 'flow-lab',
      currentLevelId: null,
      scriptId: null,
      channelId: 'test-channel',
    });
  });

  beforeEach(() => {
    mockPost.mockReset();
    mockReportGatewayError.mockReset();
    respondWith(RESPONSE_BODY);
  });

  it('posts to the generateImage route with the schema version', async () => {
    await generateImageThroughGateway({
      model: 'gpt-image-1',
      prompt: 'a beach',
    });

    const [url, , withAuthenticityToken, headers] = mockPost.mock.calls[0];
    expect(url).toBe('https://ai-gateway.code.org/generateImage');
    // A different origin authenticating on the JWT alone; no Rails CSRF token.
    expect(withAuthenticityToken).toBe(false);
    expect(headers['X-AI-Gateway-Schema-Version']).toBe(CURRENT_SCHEMA_VERSION);
    expect(headers['Content-Type']).toBe('application/json');
  });

  // The worker parses what we send against this schema. Nothing validates the
  // request on the way out at runtime, so drift between the two would only
  // show up as a 400 in production.
  it('sends a body the request schema accepts', async () => {
    await generateImageThroughGateway({
      model: 'gpt-image-1',
      prompt: 'a dragon',
      images: [{base64: 'AAAA', mediaType: 'image/png'}],
      size: '1024x1024',
      providerOptions: {openai: {background: 'transparent'}},
    });

    // Request schemas are private to the contract module; the versioned map
    // is the door onto them.
    const parsed = generateImageRequestSchemas[1].safeParse(sentBody());
    expect(parsed.success).toBe(true);
  });

  it('reduces an AI SDK model object to its id, and carries the token', async () => {
    await generateImageThroughGateway({
      model: {modelId: 'gpt-image-1'},
      prompt: 'a beach',
    });

    expect(sentBody()).toMatchObject({
      model: 'gpt-image-1',
      token: 'jwt.token.here',
    });
  });

  it('decodes the base64 images and hands back the first one', async () => {
    const result = await generateImageThroughGateway({
      model: 'gpt-image-1',
      prompt: 'a beach',
    });

    expect(result.images).toHaveLength(1);
    expect(result.image.mediaType).toBe('image/png');
    expect(Array.from(result.image.uint8Array)).toEqual([1, 2, 3]);
    expect(result.usage?.totalTokens).toBe(5);
  });

  it('throws rather than returning an imageless result', async () => {
    respondWith({images: []});

    await expect(
      generateImageThroughGateway({model: 'gpt-image-1', prompt: 'a beach'})
    ).rejects.toThrow('No image was generated');
  });

  it('reports a response the schema rejects', async () => {
    // `images` is required; a response without it is the shape a worker
    // change could regress into.
    respondWith({warnings: []});

    await generateImageThroughGateway({
      model: 'gpt-image-1',
      prompt: 'a beach',
    }).catch(() => undefined);

    expect(mockReportGatewayError).toHaveBeenCalledWith(
      expect.anything(),
      'generateImageThroughGateway',
      'gpt-image-1',
      {'error.category': 'schema-mismatch'}
    );
  });
});
