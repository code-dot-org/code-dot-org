import * as Observability from '@code-dot-org/core/plugins/observability';

import {
  inferGatewayErrorCategory,
  reportGatewayError,
} from '@cdo/apps/aiGateway/logHelper';
import {NetworkError} from '@cdo/apps/util/HttpClient';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  recordError: jest.fn(),
}));

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// inferGatewayErrorCategory
// ---------------------------------------------------------------------------

describe('inferGatewayErrorCategory', () => {
  it.each([
    [401, 'jwt_invalid'],
    [429, 'rate_limit_local'],
    [504, 'provider_timeout'],
    [500, 'provider_5xx'],
    [503, 'provider_5xx'],
    [422, 'validation_error'],
    [400, 'validation_error'],
    [200, 'unhandled'],
    [0, 'unhandled'],
  ])('status %i → %s', (status, expected) => {
    expect(inferGatewayErrorCategory(status)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// reportGatewayError helpers
// ---------------------------------------------------------------------------

const makeNetworkError = (status: number, bodyText = '') => {
  const response = new Response(bodyText, {status});
  return new NetworkError('request failed', response);
};

// ---------------------------------------------------------------------------
// reportGatewayError — NetworkError
// ---------------------------------------------------------------------------

describe('reportGatewayError with a NetworkError', () => {
  it('calls recordError with status in context and inferred category in tags', async () => {
    const error = makeNetworkError(429);
    await reportGatewayError(error, 'generateTextThroughGateway', 'my-model');

    expect(Observability.recordError).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        'http.status_code': 429,
        'ai.model': 'my-model',
      }),
      expect.objectContaining({
        'error.category': 'rate_limit_local',
        feature: 'ai-gateway',
      })
    );
  });

  it('uses caller-supplied error.category over the inferred one', async () => {
    const error = makeNetworkError(500);
    await reportGatewayError(error, 'generateTextThroughGateway', 'my-model', {
      'error.category': 'schema-mismatch',
    });

    expect(Observability.recordError).toHaveBeenCalledWith(
      error,
      expect.anything(),
      expect.objectContaining({'error.category': 'schema-mismatch'})
    );
  });

  it('merges extra caller tags into the tags argument', async () => {
    const error = makeNetworkError(422);
    await reportGatewayError(error, 'generateTextThroughGateway', 'my-model', {
      'extra.tag': 'extra-value',
    });

    expect(Observability.recordError).toHaveBeenCalledWith(
      error,
      expect.anything(),
      expect.objectContaining({'extra.tag': 'extra-value'})
    );
  });
});

// ---------------------------------------------------------------------------
// reportGatewayError — generic (non-network) error
// ---------------------------------------------------------------------------

describe('reportGatewayError with a generic Error', () => {
  it('still calls recordError', async () => {
    const error = new Error('something went wrong');
    await reportGatewayError(error, 'generateTextThroughGateway', 'my-model');

    expect(Observability.recordError).toHaveBeenCalledWith(
      error,
      expect.anything(),
      expect.anything()
    );
  });

  it('omits http.status_code from context', async () => {
    const error = new Error('something went wrong');
    await reportGatewayError(error, 'generateTextThroughGateway', 'my-model');

    const contextArg = (Observability.recordError as jest.Mock).mock
      .calls[0][1];
    expect(contextArg).not.toHaveProperty('http.status_code');
  });

  it('sets error.category to unhandled', async () => {
    const error = new Error('something went wrong');
    await reportGatewayError(error, 'generateTextThroughGateway', 'my-model');

    expect(Observability.recordError).toHaveBeenCalledWith(
      error,
      expect.anything(),
      expect.objectContaining({'error.category': 'unhandled'})
    );
  });
});
