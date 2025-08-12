/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import {SOURCE_FILE} from './constants';
import type {ResponseValidator} from './responseValidators';
import {ProjectSources, ProjectVersion, SaveSourceOptions} from './types';
import {stringifyQueryParams} from './utils';

type GetResponse<ResponseType> = {
  value: ResponseType;
  response: Response;
};

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

export async function get(
  channelId: string,
  versionId?: string,
  validator?: ResponseValidator<ProjectSources>,
): Promise<GetResponse<ProjectSources | undefined>> {
  let url = rootUrl(channelId);
  if (versionId) {
    url += `?version=${versionId}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      return {
        value: undefined,
        response,
      };
    }

    throw new Error('Error retrieving sources');
  }
  const json = await response.json();

  const value = validator ? validator(json) : json;

  return {
    value,
    response,
  };
}

export async function update(
  channelId: string,
  sources: ProjectSources,
  options?: SaveSourceOptions
): Promise<Response> {
  const url = rootUrl(channelId) + stringifyQueryParams(options as Record<string, string>);
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify(sources),
  });
}

export async function getVersionList(
  channelId: string
): Promise<GetResponse<ProjectVersion[]>> {
  const requestUrl = rootUrl(channelId) + '/versions';
  const response = await fetch(requestUrl);
  return {
    value: await response.json() as unknown as ProjectVersion[],
    response,
  };
}

export async function restore(channelId: string, versionId: string): Promise<Response> {
  const url = rootUrl(channelId) + `/restore?version=${versionId}`;
  return fetch(url, {
    method: 'PUT',
  });
}
