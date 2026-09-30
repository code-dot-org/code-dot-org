import {parseReactions, Reaction} from '@code-dot-org/lesson-deep-dive';

import HttpClient from '@cdo/apps/util/HttpClient';

// Adds/removes the signed-in viewer's emoji reaction on a gallery item. Each
// item's reactions hang off a collection path: POST adds to it, DELETE
// <path>/<emoji> removes. Both endpoints return the item's full, updated
// reaction tallies — counts fold in other viewers' reactions — so the caller
// reconciles its chips from the returned list rather than assuming its
// optimistic guess.

export const challengeResponseReactionsPath = (responseId: number) =>
  `/challenge_responses/${responseId}/reactions`;

export const classGalleryProjectReactionsPath = (channel: string) =>
  `/class_gallery_projects/${encodeURIComponent(channel)}/reactions`;

const reactionsFromBody = (bodyJson: unknown): Reaction[] =>
  parseReactions((bodyJson as {reactions?: unknown} | null)?.reactions);

export const addReaction = async (
  reactionsPath: string,
  emoji: string
): Promise<Reaction[]> => {
  const response = await HttpClient.post(
    reactionsPath,
    JSON.stringify({emoji}),
    true,
    {'Content-Type': 'application/json'}
  );
  return reactionsFromBody(await response.json());
};

export const removeReaction = async (
  reactionsPath: string,
  emoji: string
): Promise<Reaction[]> => {
  const response = await HttpClient.delete(
    `${reactionsPath}/${encodeURIComponent(emoji)}`,
    true
  );
  return reactionsFromBody(await response.json());
};
