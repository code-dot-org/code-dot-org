import {type Mock, describe, expect, it, vi} from 'vitest';

import {listChallenges} from '../api';

const makeTransport = () => {
  const request: Mock = vi.fn();
  const transport = {
    request,
    requestBlob: vi.fn(),
    requestWithMeta: vi.fn(),
  };
  return {transport, request};
};

describe('listChallenges', () => {
  it('should request the challenges for the lesson', async () => {
    const {transport, request} = makeTransport();
    request.mockResolvedValue([]);

    await listChallenges(transport, 42);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/challenges?lesson_id=42',
    });
  });

  it('should return the validated challenges', async () => {
    const {transport, request} = makeTransport();
    request.mockResolvedValue([
      {
        id: 1,
        lesson_id: 42,
        question: 'Draw a flowchart.',
        default_modality: 'whiteboard',
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
    ]);

    expect(await listChallenges(transport, 42)).toEqual([
      {
        id: 1,
        lesson_id: 42,
        question: 'Draw a flowchart.',
        default_modality: 'whiteboard',
        whiteboard_starter_image_alt_text: null,
        whiteboard_starter_image_url: null,
      },
    ]);
  });
});
