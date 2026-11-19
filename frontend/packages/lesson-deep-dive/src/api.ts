import type {Transport} from '@code-dot-org/core/api';

import {
  challengeResponseValidator,
  challengeValidator,
  practiceProblemValidator,
  userPracticeProblemAttemptValidator,
  type Challenge,
  type ChallengeResponse,
  type ChallengeResponseAsset,
  type MatchSolution,
  type MultiSolution,
  type PracticeProblem,
  type ReflectionValue,
  type ScrambleSolution,
  type UserPracticeProblemAttempt,
} from './types';

export type CreateChallengeResponseRequest = {
  challenge_id: number;
  is_final: boolean;
  assets: {asset_type: ChallengeResponseAsset['asset_type']}[];
  transcript: string | null;
  student_text?: string | null;
};

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

/** POST /challenge_responses */
export async function createChallengeResponse(
  transport: Transport,
  request: CreateChallengeResponseRequest,
): Promise<ChallengeResponse> {
  const raw = await transport.request<Record<string, unknown>>({
    method: 'POST',
    url: '/challenge_responses',
    body: request,
  });
  return challengeResponseValidator(raw);
}

/** PUT /challenge_response_assets/:id/upload */
export async function uploadChallengeResponseAsset(
  transport: Transport,
  assetId: number,
  data: Blob,
  contentType: string,
): Promise<void> {
  await transport.request<unknown>({
    method: 'PUT',
    url: `/challenge_response_assets/${assetId}/upload`,
    body: data,
    headers: {'Content-Type': contentType},
  });
}

/** GET /practice_problems */
export async function listPracticeProblems(
  transport: Transport,
  objectiveIds: string[],
): Promise<PracticeProblem[]> {
  const params = new URLSearchParams();
  objectiveIds.forEach(id => params.append('objective_ids[]', id));
  const raw = await transport.request<unknown[]>({
    method: 'GET',
    url: `/practice_problems?${params.toString()}`,
  });
  return practiceProblemValidator(raw);
}

/** GET /user_practice_problem_attempts */
export async function listPracticeProblemAttempts(
  transport: Transport,
  problemIds: number[],
): Promise<UserPracticeProblemAttempt[]> {
  const params = new URLSearchParams();
  problemIds.forEach(id => params.append('problem_ids[]', String(id)));
  const raw = await transport.request<unknown[]>({
    method: 'GET',
    url: `/user_practice_problem_attempts?${params.toString()}`,
  });
  return userPracticeProblemAttemptValidator(raw);
}

export type SavePracticeProblemAttemptRequest = {
  practice_problem_id: number;
  correct: boolean;
  delivery_context_type: string;
  attempt: {solution: (MultiSolution | ScrambleSolution | MatchSolution)[]};
  delivery_context_metadata: {lesson_id: number};
};

/** POST /user_practice_problem_attempts */
export async function savePracticeProblemAttempt(
  transport: Transport,
  request: SavePracticeProblemAttemptRequest,
): Promise<{id: number}> {
  return transport.request<{id: number}>({
    method: 'POST',
    url: '/user_practice_problem_attempts/',
    body: request,
  });
}

/** PUT /user_practice_problem_attempts/:id */
export async function updatePracticeProblemAttemptFeedback(
  transport: Transport,
  attemptId: number,
  feedback: string,
): Promise<void> {
  await transport.request<unknown>({
    method: 'PUT',
    url: `/user_practice_problem_attempts/${attemptId}`,
    body: {ai_feedback: feedback},
  });
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
