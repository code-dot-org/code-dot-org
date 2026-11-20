import type {Transport} from '@code-dot-org/core/api';

import {
  challengeValidator,
  type Challenge,
  type ReflectionValue,
} from './types';

/** GET /challenges */
export async function listChallenges(
  transport: Transport,
  lessonId: number,
): Promise<Challenge[]> {
  const params = new URLSearchParams({lesson_id: lessonId.toString()});
  const raw = await transport.request<unknown[]>({
    method: 'GET',
    url: `/challenges?${params.toString()}`,
  });
  return challengeValidator(raw);
}

/** POST /user_lesson_reflections */
export async function saveLessonReflection(
  transport: Transport,
  lessonId: number,
  success: string,
  struggle: string,
): Promise<void> {
  await transport.request<unknown>({
    method: 'POST',
    url: '/user_lesson_reflections',
    body: {lesson_id: lessonId, success, struggle},
  });
}

/** POST /user_lesson_objective_reflections */
export async function saveLessonObjectiveReflection(
  transport: Transport,
  objectiveId: string,
  reflection: ReflectionValue,
): Promise<void> {
  await transport.request<unknown>({
    method: 'POST',
    url: '/user_lesson_objective_reflections',
    body: {objective_id: objectiveId, reflection},
  });
}

/** GET /ai_student_podcasts */
export async function getPodcast(
  transport: Transport,
  query: string,
): Promise<{podcast_script?: string | null}> {
  return transport.request<{podcast_script?: string | null}>({
    method: 'GET',
    url: `/ai_student_podcasts?${query}`,
  });
}

/** POST /ai_student_podcasts/generate_podcast */
export async function generatePodcast(
  transport: Transport,
  lessonId: number,
  objectiveIds: string[],
): Promise<void> {
  await transport.request<unknown>({
    method: 'POST',
    url: '/ai_student_podcasts/generate_podcast',
    body: {lesson_id: lessonId, objective_ids: objectiveIds},
  });
}
