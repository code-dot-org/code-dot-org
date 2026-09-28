import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createProgressApi} from '../progress.api';

function mockTransport(
  response: unknown,
): Transport & {request: ReturnType<typeof vi.fn>} {
  return {
    request: vi.fn().mockResolvedValue(response),
    requestBlob: vi.fn(),
    requestWithMeta: vi.fn(),
  };
}

// Trimmed from a real /api/user_progress response.
const signedIn = {
  signedIn: true,
  teacherViewingStudent: false,
  lockableAuthorized: false,
  isInstructor: false,
  completed: false,
  progress: {
    '323': {status: 'perfect', result: 100, time_spent: 42},
    '324': {locked: true},
    '325': {
      status: 'attempted',
      result: -50,
      pages_completed: [30, null],
    },
  },
  current_lesson: 264,
  someFieldTheSchemaDoesNotName: 1,
};

describe('createProgressApi', () => {
  it('GETs user progress for a script', async () => {
    const transport = mockTransport({signedIn: false});
    await createProgressApi(transport).getUserProgress({scriptName: 'csd1'});
    expect(transport.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/user_progress/csd1',
      query: {user_id: undefined},
    });
  });

  it('asks for a student by user_id', async () => {
    const transport = mockTransport({signedIn: false});
    await createProgressApi(transport).getUserProgress({
      scriptName: 'csd1',
      userId: 42,
    });
    expect(transport.request.mock.calls[0][0].query).toEqual({user_id: 42});
  });

  it('parses a signed-out response', async () => {
    const api = createProgressApi(mockTransport({signedIn: false}));
    await expect(api.getUserProgress({scriptName: 'csd1'})).resolves.toEqual({
      signedIn: false,
    });
  });

  it('parses a signed-in response and keeps unnamed fields', async () => {
    const api = createProgressApi(mockTransport(signedIn));
    const parsed = await api.getUserProgress({scriptName: 'csd1'});
    expect(parsed).toEqual(signedIn);
    expect(parsed.progress?.['324']).toEqual({locked: true});
  });

  it('rejects a response of the wrong shape', async () => {
    const api = createProgressApi(mockTransport({progress: []}));
    await expect(api.getUserProgress({scriptName: 'csd1'})).rejects.toThrow();
  });
});
