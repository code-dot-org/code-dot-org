import * as utils from '@cdo/apps/utils';

import {ProjectType} from '../types';

const rootUrl = '/projects/';

// Given a levelId and optionally a scriptId,
// get the project identifier (channel id) for that level (and script, if provided).
export async function getChannelForLevel(
  levelId: number,
  scriptId?: number,
  scriptLevelId?: string,
  userId?: number
): Promise<Response> {
  let requestString = rootUrl;
  if (scriptId !== undefined) {
    requestString += `script/${scriptId}/`;
  }
  if (scriptLevelId !== undefined) {
    requestString += `script_level/${scriptLevelId}/`;
  }
  requestString += `level/${levelId}`;
  if (userId !== undefined) {
    requestString += `/user/${userId}`;
  }
  return fetch(requestString);
}

export async function redirectToRemix(
  channelId: string,
  projectType: ProjectType
) {
  utils.navigateToHref(`${rootUrl}${projectType}/${channelId}/remix`);
}

export async function redirectToView(
  channelId: string,
  projectType: ProjectType
) {
  utils.navigateToHref(`${rootUrl}${projectType}/${channelId}/view`);
}
