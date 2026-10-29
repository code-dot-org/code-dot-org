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
});
