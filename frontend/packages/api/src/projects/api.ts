import {
  getEnvironmentFromHostname,
  getDashboardApiUrl,
} from '@code-dot-org/core';

import type {ProjectType} from './types';

const host = getDashboardApiUrl(getEnvironmentFromHostname());
const rootUrl = `${host}/projects/`;

// Given a levelId and optionally a scriptId,
// get the project identifier (channel id) for that level (and script, if provided).
export async function getChannelForLevel(
  levelId: number,
  scriptId?: number,
  userId?: number,
): Promise<Response> {
  let requestString = rootUrl;
  if (scriptId !== undefined) {
    requestString += `script/${scriptId}/`;
  }
  requestString += `level/${levelId}`;
  if (userId !== undefined) {
    requestString += `/user/${userId}`;
  }
  return fetch(requestString);
}

export async function redirectToRemix(
  channelId: string,
  projectType: ProjectType,
) {
  window.location.href = `${rootUrl}${projectType}/${channelId}/remix`;
}

export async function redirectToView(
  channelId: string,
  projectType: ProjectType,
) {
  window.location.href = `${rootUrl}${projectType}/${channelId}/view`;
}
