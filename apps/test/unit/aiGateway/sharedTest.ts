import {
  getAiGatewayUrl,
  PRODUCTION_AI_GATEWAY_URL,
} from '@cdo/apps/aiGateway/shared';

const PREVIEW =
  'openai-image-model-ai-gateway-development.code-org.workers.dev';

function withSearch(search: string) {
  Object.defineProperty(window, 'location', {
    value: {search},
    writable: true,
    configurable: true,
  });
}

describe('getAiGatewayUrl', () => {
  let warn: jest.SpyInstance;
  let info: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    info = jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('is production when the page says nothing', () => {
    withSearch('');
    expect(getAiGatewayUrl()).toBe(PRODUCTION_AI_GATEWAY_URL);
    expect(warn).not.toHaveBeenCalled();
  });

  it('accepts a preview deployment on the org Cloudflare subdomain', () => {
    withSearch(`?aiGatewayUrl=https://${PREVIEW}`);
    expect(getAiGatewayUrl()).toBe(`https://${PREVIEW}`);
    expect(info).toHaveBeenCalledWith(expect.stringContaining(PREVIEW));
  });

  it('accepts the bare hostname too', () => {
    withSearch(`?aiGatewayUrl=${PREVIEW}`);
    expect(getAiGatewayUrl()).toBe(`https://${PREVIEW}`);
  });

  // The request carries a signed JWT for the current user and their prompt.
  // Every case below is a link someone could send to collect both.
  describe('refuses, loudly, anything off the allowlist', () => {
    it.each([
      ['an unrelated host', 'https://evil.example.com'],
      ['a suffix lookalike', 'https://foo.code-org.workers.dev.evil.com'],
      ['a path lookalike', 'https://evil.example.com/x.code-org.workers.dev'],
      ['a subdomain of nothing', 'https://code-org.workers.dev.evil.com'],
      ['embedded credentials', `https://user:pass@${PREVIEW}@evil.example.com`],
      ['a different workers account', 'https://x.someone-else.workers.dev'],
      ['a non-http scheme', `javascript:fetch('//evil.example.com')`],
    ])('%s', (_label, value) => {
      withSearch(`?aiGatewayUrl=${encodeURIComponent(value)}`);
      expect(getAiGatewayUrl()).toBe(PRODUCTION_AI_GATEWAY_URL);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Using production')
      );
    });
  });

  // Only the hostname survives, so nothing else in the value can reach the
  // request.
  it.each([
    ['a path', `https://${PREVIEW}/steal`],
    ['a query', `https://${PREVIEW}?x=1`],
    ['a fragment', `https://${PREVIEW}#x`],
  ])('strips %s and keeps the host', (_label, value) => {
    withSearch(`?aiGatewayUrl=${encodeURIComponent(value)}`);
    expect(getAiGatewayUrl()).toBe(`https://${PREVIEW}`);
  });

  // A port is not stripped, it is disqualifying: the allowlist has no ':' in
  // it, so a host:port never matches and falls back rather than being
  // silently rewritten to the default port.
  it('refuses a port rather than dropping it', () => {
    withSearch(
      `?aiGatewayUrl=${encodeURIComponent(`https://${PREVIEW}:8080`)}`
    );
    expect(getAiGatewayUrl()).toBe(PRODUCTION_AI_GATEWAY_URL);
    expect(warn).toHaveBeenCalled();
  });

  it('upgrades an http override to https rather than honouring it', () => {
    withSearch(`?aiGatewayUrl=${encodeURIComponent(`http://${PREVIEW}`)}`);
    expect(getAiGatewayUrl()).toBe(`https://${PREVIEW}`);
  });
});
