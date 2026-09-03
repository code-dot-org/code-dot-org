import type {Transport} from '@code-dot-org/core/api';

import {challengeResponseListValidator, type ChallengeResponse} from '../types';

import {
  challengeResponseDetailValidator,
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

// tutor/gallery_data is a sibling route of the tutor/gallery page; lessonPath
// is the page path with the trailing /tutor/gallery removed, so both URL
// grammars work. No consumer yet.
export async function getTutorGalleryData(
  transport: Transport,
  lessonPath: string,
): Promise<TutorGalleryData> {
  return transport.request<TutorGalleryData>({
    method: 'GET',
    url: `${lessonPath}/tutor/gallery_data`,
  });
}
