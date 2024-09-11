/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import HttpClient, {GetResponse} from '@cdo/apps/util/HttpClient';

import {SOURCE_FILE} from '../constants';
import {SourceResponseValidator} from '../responseValidators';
import {
  ProjectSources,
  ProjectVersion,
  SaveSourceOptions,
  UpdateSourceOptions,
} from '../types';

const {stringifyQueryParams} = require('@cdo/apps/utils');

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

export async function get(
  channelId: string,
  versionId?: string
): Promise<GetResponse<ProjectSources>> {
  let url = rootUrl(channelId);
  if (versionId) {
    url += `?version=${versionId}`;
  }
  return HttpClient.fetchJson<ProjectSources>(url, {}, SourceResponseValidator);
}

export async function update(
  channelId: string,
  sources: ProjectSources,
  options?: SaveSourceOptions | UpdateSourceOptions
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
