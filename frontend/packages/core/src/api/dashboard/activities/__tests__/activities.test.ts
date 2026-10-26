import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createActivitiesApi} from '../activities.api';

function mockTransport(): Transport & {request: ReturnType<typeof vi.fn>} {
  return {
    request: vi.fn().mockResolvedValue({}),
    requestBlob: vi.fn(),
    requestWithMeta: vi.fn(),
  };
}

describe('createActivitiesApi', () => {
  it('POSTs milestone with correct path and body', async () => {
    const transport = mockTransport();
    const api = createActivitiesApi(transport);

    await api.reportMilestone({
      userId: 0,
      scriptLevelId: '158433',
      levelId: 19419,
      result: true,
    });

    expect(transport.request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/milestone/0/158433/19419',
      body: {result: 'true', testResult: 100},
    });
  });

  it('uses userId 0 for anonymous users', async () => {
    const transport = mockTransport();
    const api = createActivitiesApi(transport);

    await api.reportMilestone({
      userId: 0,
      scriptLevelId: '158432',
      levelId: 19423,
      result: true,
    });

    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({url: '/milestone/0/158432/19423'}),
    );
  });

  it('passes custom testResult when provided', async () => {
    const transport = mockTransport();
    const api = createActivitiesApi(transport);

    await api.reportMilestone({
      userId: 42,
      scriptLevelId: '158433',
      levelId: 19419,
      result: false,
      testResult: 0,
    });

    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {result: 'false', testResult: 0},
      }),
    );
  });

  it('sends the Lab2 fields and course_id when given', async () => {
    const transport = mockTransport();
    const api = createActivitiesApi(transport);

    await api.reportMilestone({
      userId: 0,
      scriptLevelId: 102,
      levelId: 323,
      result: true,
      testResult: 1000,
      app: 'music',
      program: 'my answer',
      submitted: true,
      timeSinceLastMilestone: 90_000,
      courseId: 17,
    });

    expect(transport.request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/milestone/0/102/323',
      query: {course_id: 17},
      body: {
        result: 'true',
        testResult: 1000,
        app: 'music',
        program: 'my answer',
        submitted: 'true',
        timeSinceLastMilestone: 90_000,
      },
    });
  });

  it('sends submitted false as the string the server compares against', async () => {
    const transport = mockTransport();
    const api = createActivitiesApi(transport);

    await api.reportMilestone({
      userId: 0,
      scriptLevelId: 102,
      levelId: 323,
      result: true,
      submitted: false,
    });

    expect(transport.request.mock.calls[0][0].body.submitted).toBe('false');
  });
});
