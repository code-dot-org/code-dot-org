/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import {SOURCE_FILE} from '../constants';
import {SourceResponseValidator} from '../responseValidators';
import {ProjectSources, ProjectVersion, SaveSourceOptions} from '../types';

type GetResponse<ResponseType> = {
  value: ResponseType;
  response: Response;
};

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

/**
 * Takes a simple object and returns it represented as a chain of url query
 * params, including ? and & as necessary. Does not perform escaping. Examples:
 * {} -> ''
 * {a: 1} -> '?a=1'
 * {a: 1, b: 'c'} -> '?a=1&b=c'
 *
 * @param params - Object to stringify.
 * @return A query parameter string.
 */
const stringifyQueryParams = (params: object) => {
  if (!params) {
    return '';
  }
  const keys = Object.keys(params);
  if (!keys.length) {
    return '';
  }
  return '?' + keys.map(key => `${key}=${params[key]}`).join('&');
}

export async function get(
  channelId: string,
  versionId?: string
): Promise<GetResponse<ProjectSources>> {
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

    throw new Error('Error retrieving sources', {response});
  }
  const json = await response.json();
  const value = SourceResponseValidator(json);

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
  const url = rootUrl(channelId) + stringifyQueryParams(options);
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify(sources),
  });
}

export async function getVersionList(
  channelId: string
): Promise<GetResponse<ProjectVersion[]>> {
  const requestUrl = rootUrl(channelId) + '/versions';
  return HttpClient.fetchJson<ProjectVersion[]>(requestUrl);
}

export async function restore(channelId: string, versionId: string) {
  const url = rootUrl(channelId) + `/restore?version=${versionId}`;
  return HttpClient.put(url);
}
