import HttpClient from '@cdo/apps/util/HttpClient';

import {Reaction, parseReactions} from '../lessonDeepDive/types';

// Adds/removes the signed-in viewer's emoji reaction on a challenge response.
// Both endpoints return the response's full, updated reaction tallies —
// counts fold in other viewers' reactions — so the caller reconciles its
// chips from the returned list rather than assuming its optimistic guess.

const reactionsFromBody = (bodyJson: unknown): Reaction[] =>
  parseReactions((bodyJson as {reactions?: unknown} | null)?.reactions);

export const addReaction = async (
  responseId: number,
  emoji: string
): Promise<Reaction[]> => {
  const response = await HttpClient.post(
    `/challenge_responses/${responseId}/reactions`,
    JSON.stringify({emoji}),
    true,
    {'Content-Type': 'application/json'}
  );
  return reactionsFromBody(await response.json());
};

export const removeReaction = async (
  responseId: number,
  emoji: string
): Promise<Reaction[]> => {
  const response = await HttpClient.delete(
    `/challenge_responses/${responseId}/reactions/${encodeURIComponent(emoji)}`,
    true
  );
  return reactionsFromBody(await response.json());
};
