import {ProjectType} from '../types';
import * as utils from '@cdo/apps/utils';

const rootUrl = '/projects/';

// Given a levelId and optionally a scriptId,
// get the project identifier (channel id) for that level (and script, if provided).
export async function getChannelForLevel(
  levelId: number,
  scriptId?: number
): Promise<Response> {
  let requestString = rootUrl;
  if (scriptId !== undefined) {
    requestString += `script/${scriptId}/`;
  }
  requestString += `level/${levelId}`;
  return fetch(requestString);
}

export async function redirectToRemix(
  channelId: string,
  projectType: ProjectType
) {
  utils.navigateToHref(`${rootUrl}${projectType}/${channelId}/remix`);
}
