import {TraceStart, startTrace} from '@cdo/apps/adaptive/ai/langfuse/trace';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn()},
}));
const mockLogError = jest.fn();
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getMetricsReporter: () => ({logError: mockLogError})}),
  },
}));

const mockPost = HttpClient.post as jest.Mock;

const start: TraceStart = {
  name: 'adaptive-instructions',
  levelId: 7,
  model: 'gemini-2.5-flash',
  prompt: 'Write instructions.',
  metadata: {stepId: 's'},
};

const postedBody = () => JSON.parse(mockPost.mock.calls[0][1]);
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('startTrace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({});
  });

  it('mints 32 hex characters, fresh each trace', () => {
    const first = startTrace(start).traceId;
    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(startTrace(start).traceId).not.toBe(first);
  });

  it('posts nothing until the trace ends', () => {
    startTrace(start);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('posts the start, the end and the timing as one JSON payload with the authenticity token', () => {
    const trace = startTrace(start);
    trace.end({
      outcome: 'success',
      output: {instructions: 'Do this.'},
      usage: {input: 10, output: 2, total: 12},
      responseId: 'resp-1',
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/adaptive/traces',
      expect.any(String),
      true,
      {'Content-Type': 'application/json'}
    );
    const body = postedBody();
    expect(body).toMatchObject({
      traceId: trace.traceId,
      traceName: 'adaptive-instructions',
      levelId: 7,
      model: 'gemini-2.5-flash',
      prompt: 'Write instructions.',
      output: {instructions: 'Do this.'},
      outcome: 'success',
      usage: {input: 10, output: 2, total: 12},
      metadata: {stepId: 's', responseId: 'resp-1'},
    });
    expect(body.endedAt).toBeGreaterThanOrEqual(body.startedAt);
    expect(body).not.toHaveProperty('errorMessage');
    expect(body).not.toHaveProperty('responseId');
  });

  it('cuts a long error message', () => {
    startTrace(start).end({outcome: 'error', errorMessage: 'x'.repeat(5_000)});

    expect(postedBody().errorMessage).toHaveLength(1_000);
  });

  it('reports a failed post without throwing', async () => {
    mockPost.mockRejectedValue(new Error('503'));

    expect(() => startTrace(start).end({outcome: 'error'})).not.toThrow();
    await flush();

    expect(mockLogError).toHaveBeenCalledWith(
      'Adaptive trace post failed',
      expect.any(Error),
      {error: 'Error: 503'}
    );
  });
});
