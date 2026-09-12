import type {Transport} from '@code-dot-org/core/api';

import {
  challengeResponseListValidator,
  parseReactions,
  type ChallengeResponse,
  type Reaction,
} from '../types';

import {
  challengeResponseDetailValidator,
  unitCountsValidator,
  type ChallengeResponseDetail,
} from './types';

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

// Both reaction endpoints return the response's full, updated tallies.
const reactionsFromBody = (body: unknown): Reaction[] =>
  parseReactions((body as {reactions?: unknown} | null)?.reactions);

export async function addReaction(
  transport: Transport,
  responseId: number,
  emoji: string,
): Promise<Reaction[]> {
  const body = await transport.request<unknown>({
    method: 'POST',
    url: `/challenge_responses/${responseId}/reactions`,
    body: {emoji},
  });
  return reactionsFromBody(body);
}

export async function removeReaction(
  transport: Transport,
  responseId: number,
  emoji: string,
): Promise<Reaction[]> {
  const body = await transport.request<unknown>({
    method: 'DELETE',
    url: `/challenge_responses/${responseId}/reactions/${encodeURIComponent(emoji)}`,
  });
  return reactionsFromBody(body);
}
