// Per-user player state, stored on the student's UserLevel row for the
// level in the unit. See UserLevelsController#update_adaptive_state.

import HttpClient from '@cdo/apps/util/HttpClient';

import {AdaptiveProgress} from './types';

function stateUrl(scriptId: number, levelId: number): string {
  return `/user_levels/adaptive_state/${scriptId}/${levelId}`;
}

// Resolves null when the user has never saved state for this level.
export async function loadAdaptiveState(
  scriptId: number,
  levelId: number
): Promise<AdaptiveProgress | null> {
  const response = await HttpClient.fetchJson<{
    state: AdaptiveProgress | null;
  }>(stateUrl(scriptId, levelId), {});
  return response.value.state;
}

export async function saveAdaptiveState(
  scriptId: number,
  levelId: number,
  state: AdaptiveProgress
): Promise<void> {
  await HttpClient.put(
    stateUrl(scriptId, levelId),
    JSON.stringify({state}),
    true,
    {'Content-Type': 'application/json'}
  );
}
