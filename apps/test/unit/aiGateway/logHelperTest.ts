import * as Observability from '@code-dot-org/core/plugins/observability';

import {
  GatewayErrorCategory,
  getErrorLogData,
  inferGatewayErrorCategory,
  reportGatewayError,
} from '@cdo/apps/aiGateway/logHelper';
import DCDO from '@cdo/apps/dcdo';
import {NetworkError} from '@cdo/apps/util/HttpClient';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  recordError: jest.fn(),
}));

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));

const mockRecordError = Observability.recordError as jest.Mock;
const mockDcdoGet = DCDO.get as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('inferGatewayErrorCategory', () => {
  const cases: [number, GatewayErrorCategory][] = [
    [401, 'jwt_invalid'],
    [429, 'rate_limit_local'],
    [504, 'provider_timeout'],
    [500, 'provider_5xx'],
    [502, 'provider_5xx'],
    [503, 'provider_5xx'],
    [400, 'validation_error'],
    [422, 'validation_error'],
    [200, 'unhandled'],
    [0, 'unhandled'],
  ];

  it.each(cases)('status %i returns %s', (status, expected) => {
    expect(inferGatewayErrorCategory(status)).toBe(expected);
  });
});

describe('getErrorLogData', () => {
  it('returns GenericError for a plain Error', async () => {
    const result = await getErrorLogData(new Error('boom'));
    expect(result.type).toBe('GenericError');
  });

  it('returns GenericError for a non-Error value', async () => {
    const result = await getErrorLogData('string error');
    expect(result.type).toBe('GenericError');
  });

  it('returns NetworkError with status and url for a NetworkError', async () => {
    const body = JSON.stringify({message: 'unauthorized'});
    const response = new Response(body, {
      status: 401,
      headers: {'Content-Type': 'application/json'},
    });
    const error = new NetworkError('HTTP 401', response);

    const result = await getErrorLogData(error);

    expect(result.type).toBe('NetworkError');
    expect((result as {status: number}).status).toBe(401);
    expect((result as {body: unknown}).body).toEqual({message: 'unauthorized'});
  });

  it('falls back to raw text when response body is not JSON', async () => {
    const response = new Response('plain text', {status: 500});
    const error = new NetworkError('HTTP 500', response);

    const result = await getErrorLogData(error);

    expect(result.type).toBe('NetworkError');
    expect((result as {body: unknown}).body).toBe('plain text');
  });
});

describe('reportGatewayError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('always calls console.error', async () => {
    mockDcdoGet.mockReturnValue(false);
    await reportGatewayError(new Error('test'));
    expect(console.error).toHaveBeenCalled();
  });

  it('includes the source in the console.error message', async () => {
    mockDcdoGet.mockReturnValue(false);
    await reportGatewayError(new Error('test'), 'myFunction');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('myFunction'),
      expect.anything()
    );
  });

  it('does not call Observability.recordError when flag is off', async () => {
    mockDcdoGet.mockReturnValue(false);
    await reportGatewayError(new Error('test'));
    expect(mockRecordError).not.toHaveBeenCalled();
  });

  it('calls Observability.recordError when flag is on', async () => {
    mockDcdoGet.mockReturnValue(true);
    await reportGatewayError(new Error('test'));
    expect(mockRecordError).toHaveBeenCalledTimes(1);
  });

  it('tags unhandled category for a plain Error', async () => {
    mockDcdoGet.mockReturnValue(true);
    const error = new Error('generic');
    await reportGatewayError(error);
    expect(mockRecordError).toHaveBeenCalledWith(
      error,
      expect.objectContaining({category: 'unhandled'})
    );
  });

  it('tags category and status_code for a NetworkError', async () => {
    mockDcdoGet.mockReturnValue(true);
    const response = new Response('', {status: 429});
    const error = new NetworkError('HTTP 429', response);
    await reportGatewayError(error);
    expect(mockRecordError).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        status_code: 429,
        category: 'rate_limit_local',
      })
    );
  });

  it('tags provider_5xx for a 500 NetworkError', async () => {
    mockDcdoGet.mockReturnValue(true);
    const response = new Response('', {status: 500});
    const error = new NetworkError('HTTP 500', response);
    await reportGatewayError(error);
    expect(mockRecordError).toHaveBeenCalledWith(
      error,
      expect.objectContaining({category: 'provider_5xx', status_code: 500})
    );
  });
});
