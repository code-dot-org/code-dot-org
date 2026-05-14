import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';

import {createProgressApi} from '../progress.api';

// A Transport stub that captures every call. The API functions never
// branch on the response, so we just resolve to undefined unless a test
// supplies a specific return value via `mockResolvedValueOnce`.
function makeTransport(): Transport & {request: ReturnType<typeof vi.fn>} {
  return {
    request: vi.fn().mockResolvedValue(undefined),
    requestBlob: vi.fn(),
    requestWithMeta: vi.fn(),
  } as unknown as Transport & {request: ReturnType<typeof vi.fn>};
}

describe('progressApi.reportMilestone', () => {
  it('POSTs to /milestone/:userId/:scriptLevelId/:levelId with the canonical body', async () => {
    const transport = makeTransport();
    const api = createProgressApi(transport);

    await api.reportMilestone({
      userId: 0,
      scriptLevelId: 7,
      levelId: 42,
      app: 'pythonlab',
      testResult: 100,
    });

    expect(transport.request).toHaveBeenCalledTimes(1);
    expect(transport.request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/milestone/0/7/42',
      body: {app: 'pythonlab', result: true, testResult: 100},
    });
  });

  it('forwards extraData (program / submitted) into the body', async () => {
    const transport = makeTransport();
    const api = createProgressApi(transport);

    await api.reportMilestone({
      userId: 0,
      scriptLevelId: 7,
      levelId: 42,
      app: 'weblab',
      testResult: 30,
      extraData: {program: 'console.log(1)', submitted: 'true'},
    });

    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/milestone/0/7/42',
        body: expect.objectContaining({
          app: 'weblab',
          result: true,
          testResult: 30,
          program: 'console.log(1)',
          submitted: 'true',
        }),
      }),
    );
  });

  it('passes through userId verbatim even when 0 (server ignores it but route still wants something)', async () => {
    const transport = makeTransport();
    const api = createProgressApi(transport);

    await api.reportMilestone({
      userId: 99,
      scriptLevelId: 7,
      levelId: 42,
      app: 'pythonlab',
      testResult: 100,
    });

    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({url: '/milestone/99/7/42'}),
    );
  });

  it('rejects with a schema error before hitting transport when the body is invalid', async () => {
    // The api method runs `MilestoneReportSchema.parse` on the body
    // before requesting — protects callers from accidentally sending
    // bogus shapes that the server would silently reject.
    const transport = makeTransport();
    const api = createProgressApi(transport);

    await expect(
      api.reportMilestone({
        userId: 0,
        scriptLevelId: 7,
        levelId: 42,
        app: 'pythonlab',
        // Passing the wrong type intentionally to verify schema validation.
        testResult: 'invalid' as unknown as number,
      }),
    ).rejects.toThrow();
    expect(transport.request).not.toHaveBeenCalled();
  });
});

describe('progressApi.getUserProgress', () => {
  it('GETs /api/user_progress/:scriptName with no query when userId is absent', async () => {
    const transport = makeTransport();
    transport.request.mockResolvedValueOnce({});
    const api = createProgressApi(transport);

    await api.getUserProgress({scriptName: 'csd-1'});

    expect(transport.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/user_progress/csd-1',
    });
  });

  it('appends ?user_id=... when userId is provided', async () => {
    const transport = makeTransport();
    transport.request.mockResolvedValueOnce({});
    const api = createProgressApi(transport);

    await api.getUserProgress({scriptName: 'csd-1', userId: '42'});

    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/api/user_progress/csd-1?user_id=42',
      }),
    );
  });

  it('URL-encodes the userId on the query string', async () => {
    const transport = makeTransport();
    transport.request.mockResolvedValueOnce({});
    const api = createProgressApi(transport);

    await api.getUserProgress({scriptName: 'csd-1', userId: 'foo bar/42'});

    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/user_progress/csd-1?user_id=foo%20bar%2F42',
      }),
    );
  });

  it('parses the response through UserProgressResponseSchema', async () => {
    const transport = makeTransport();
    transport.request.mockResolvedValueOnce({
      isInstructor: true,
      progress: {100: {status: 'perfect', result: 100}},
    });
    const api = createProgressApi(transport);

    const out = await api.getUserProgress({scriptName: 'csd-1'});

    expect(out.isInstructor).toBe(true);
    expect(out.progress?.[100]?.status).toBe('perfect');
  });

  it('throws when the server returns a malformed payload', async () => {
    const transport = makeTransport();
    transport.request.mockResolvedValueOnce({
      // `progress` must be a record of UnitProgressDefinitions; a stray
      // shape under a level id should fail to parse.
      progress: {100: {result: 100 /* missing status */}},
    });
    const api = createProgressApi(transport);

    await expect(api.getUserProgress({scriptName: 'csd-1'})).rejects.toThrow();
  });
});
