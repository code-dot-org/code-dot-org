import type {Transport} from '@code-dot-org/core/api';

import {challengeValidator, type Challenge} from './types';

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
