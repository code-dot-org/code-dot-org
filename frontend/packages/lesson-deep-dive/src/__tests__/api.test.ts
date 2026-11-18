import {type Mock, describe, expect, it, vi} from 'vitest';

import {
  createChallengeResponse,
  generatePodcast,
  getPodcast,
  listChallenges,
  saveLessonObjectiveReflection,
  saveLessonReflection,
  uploadChallengeResponseAsset,
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

describe('createChallengeResponse', () => {
  it('should post the response and return it validated', async () => {
    const {transport, request} = makeTransport();
    request.mockResolvedValue({
      id: 7,
      challenge_id: 3,
      user_id: 1,
      is_final: true,
      created_at: '2026-10-01T00:00:00Z',
      assets: [{id: 9, asset_type: 'video'}],
    });
    const body = {
      challenge_id: 3,
      is_final: true,
      assets: [{asset_type: 'video' as const}],
      transcript: 'hello',
    };

    const created = await createChallengeResponse(transport, body);

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/challenge_responses',
      body,
    });
    expect(created.assets).toEqual([
      {id: 9, asset_type: 'video', download_url: null},
    ]);
  });
});

describe('uploadChallengeResponseAsset', () => {
  it('should put the bytes with their content type', async () => {
    const {transport, request} = makeTransport();
    const data = new Blob(['video'], {type: 'video/webm'});

    await uploadChallengeResponseAsset(transport, 9, data, 'video/webm');

    expect(request).toHaveBeenCalledWith({
      method: 'PUT',
      url: '/challenge_response_assets/9/upload',
      body: data,
      headers: {'Content-Type': 'video/webm'},
    });
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

describe('getPodcast', () => {
  it('should request the podcast for the query', async () => {
    const {transport, request} = makeTransport();
    request.mockResolvedValue({podcast_script: null});

    expect(
      await getPodcast(transport, 'lesson_id=42&objective_ids%5B%5D=1'),
    ).toEqual({podcast_script: null});
    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/ai_student_podcasts?lesson_id=42&objective_ids%5B%5D=1',
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
