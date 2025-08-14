/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import HttpClient from '../HttpClient';
import type {AppName} from '../projects/types';
import type {GetResponse} from '../types';
import {stringifyQueryParams} from '../utils';

import {SOURCE_FILE} from './constants';
import {SourceResponseValidator} from './responseValidators';
import {ProjectSources, ProjectVersion, SaveSourceOptions} from './types';

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

export async function get(
  appName: AppName,
  channelId: string,
  versionId?: string
): Promise<GetResponse<ProjectSources>> {
  let url = rootUrl(channelId);
  if (versionId) {
    url += `?version=${versionId}`;
  }
  return HttpClient.fetchJson<ProjectSources>(url, {}, SourceResponseValidator(appName));
}

export async function update(
  channelId: string,
  sources: ProjectSources,
  options?: SaveSourceOptions
): Promise<Response> {
  const url = rootUrl(channelId) + options ? stringifyQueryParams(options as Record<string, string>) : '';
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
