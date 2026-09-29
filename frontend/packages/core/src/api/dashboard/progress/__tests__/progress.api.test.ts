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

describe('hidden lessons', () => {
  it('GETs a unit and parses a participant list', async () => {
    const transport = mockTransport([3, 5]);
    const api = createProgressApi(transport);
    await expect(api.getHiddenLessons({scriptName: 'csd1'})).resolves.toEqual([
      3, 5,
    ]);
    expect(transport.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/s/csd1/hidden_lessons',
    });
  });

  it('parses an instructor map of section to lessons', async () => {
    const api = createProgressApi(mockTransport({'11': [3], '12': []}));
    await expect(api.getHiddenLessons({scriptName: 'csd1'})).resolves.toEqual({
      '11': [3],
      '12': [],
    });
  });

  it('POSTs a lesson toggle as a stage, and a unit toggle without one', async () => {
    const transport = mockTransport([]);
    const api = createProgressApi(transport);
    await api.toggleHidden({
      scriptName: 'csd1',
      sectionId: 11,
      lessonId: 3,
      hidden: true,
    });
    await api.toggleHidden({scriptName: 'csd1', sectionId: 11, hidden: false});
    expect(transport.request.mock.calls.map(c => c[0])).toEqual([
      {
        method: 'POST',
        url: '/s/csd1/toggle_hidden',
        body: {section_id: 11, hidden: true, stage_id: 3},
      },
      {
        method: 'POST',
        url: '/s/csd1/toggle_hidden',
        body: {section_id: 11, hidden: false},
      },
    ]);
  });
});

describe('lock status', () => {
  const student = {
    user_level_data: {user_id: 1, level_id: 2, script_id: 3},
    name: 'Ada',
    locked: true,
    readonly_answers: false,
    is_demo_student: false,
  };

  it('GETs and parses every instructed section', async () => {
    const response = {
      '11': {
        section_id: 11,
        section_name: 'Period 1',
        ai_chat_access_level: 'enabled',
        lessons: {'264': [student]},
      },
    };
    const transport = mockTransport(response);
    await expect(createProgressApi(transport).getLockStatus()).resolves.toEqual(
      response,
    );
    expect(transport.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/lock_status',
    });
  });

  it('POSTs updates', async () => {
    const transport = mockTransport({});
    const updates = [
      {
        user_level_data: student.user_level_data,
        locked: false,
        readonly_answers: true,
      },
    ];
    await createProgressApi(transport).updateLockStatus({updates});
    expect(transport.request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/lock_status',
      body: {updates},
    });
  });
});
