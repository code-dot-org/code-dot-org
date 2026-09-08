import type {Transport} from '@code-dot-org/core/api';

import {challengeResponseListValidator, type ChallengeResponse} from '../types';

import {
  challengeResponseDetailValidator,
  tutorGalleryDataValidator,
  unitCountsValidator,
  type ChallengeResponseDetail,
  type TutorGalleryData,
} from './types';

// The gallery's Rails calls. URLs are root-relative; the host (a webpack
// entry or dev shell) supplies a same-origin transport via ApiClientContext,
// so these ride the page's cookies the same way apps/util/HttpClient did.
// Validators are the same ones HttpClient used.

export async function listChallengeResponses(
  transport: Transport,
  params: URLSearchParams,
): Promise<ChallengeResponse[]> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    url: `/challenge_responses?${params.toString()}`,
  });
  return challengeResponseListValidator(raw as Record<string, unknown>[]);
}

export async function getUnitCounts(
  transport: Transport,
  params: URLSearchParams,
): Promise<Record<string, number>> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    url: `/challenge_responses/unit_counts?${params.toString()}`,
  });
  return unitCountsValidator(raw as Record<string, unknown>);
}

export async function getChallengeResponse(
  transport: Transport,
  id: number,
): Promise<ChallengeResponseDetail> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    url: `/challenge_responses/${id}`,
  });
  return challengeResponseDetailValidator(raw as Record<string, unknown>);
}

export async function getTutorGalleryData(
  transport: Transport,
  script: string,
  lessonPosition: number,
): Promise<TutorGalleryData> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    url: `/api/v1/scripts/${script}/lessons/${lessonPosition}/tutor_gallery_data`,
  });
  return tutorGalleryDataValidator(raw as Record<string, unknown>);
}
