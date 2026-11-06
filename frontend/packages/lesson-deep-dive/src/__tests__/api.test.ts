import {type Mock, describe, expect, it, vi} from 'vitest';

import {
  generatePodcast,
  listChallenges,
  saveLessonObjectiveReflection,
  saveLessonReflection,
} from '../api';

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

describe('saveLessonReflection', () => {
  it('should post the lesson reflection', async () => {
    const {transport, request} = makeTransport();
    request.mockResolvedValue({});

    await saveLessonReflection(transport, 42, 'Loops', 'Recursion');

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/user_lesson_reflections',
      body: {lesson_id: 42, success: 'Loops', struggle: 'Recursion'},
    });
  });
});

describe('saveLessonObjectiveReflection', () => {
  it('should post the objective reflection', async () => {
    const {transport, request} = makeTransport();
    request.mockResolvedValue({});

    await saveLessonObjectiveReflection(transport, '7', 'unsure');

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/user_lesson_objective_reflections',
      body: {objective_id: '7', reflection: 'unsure'},
    });
  });
});

describe('generatePodcast', () => {
  it('should post the lesson and the objectives to cover', async () => {
    const {transport, request} = makeTransport();
    request.mockResolvedValue({});

    await generatePodcast(transport, 42, ['1', '2']);

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/ai_student_podcasts/generate_podcast',
      body: {lesson_id: 42, objective_ids: ['1', '2']},
    });
  });
});
