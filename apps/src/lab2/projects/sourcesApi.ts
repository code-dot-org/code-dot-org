/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import HttpClient, {GetResponse} from '@cdo/apps/util/HttpClient';
import {
  isWeblab1CompatibilityModeEnabled,
  loadWeblab1ProjectAsLab2Sources,
  shouldFallbackToWeblab1Files,
} from '@cdo/apps/weblab2/weblab1Compatibility';

import {SOURCE_FILE} from '../constants';
import {SourceResponseValidator} from '../responseValidators';
import {ProjectSources, ProjectVersion, SaveSourceOptions} from '../types';

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
  try {
    return await HttpClient.fetchJson<ProjectSources>(
      url,
      {},
      SourceResponseValidator
    );
  } catch (error) {
    if (
      isWeblab1CompatibilityModeEnabled() &&
      shouldFallbackToWeblab1Files(error)
    ) {
      return loadWeblab1ProjectAsLab2Sources(channelId, versionId);
    }
    throw error;
  }
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
  channelId: string,
  includeComments: boolean = false
): Promise<GetResponse<ProjectVersion[]>> {
  let requestUrl = rootUrl(channelId) + '/versions';
  if (includeComments) {
    requestUrl += '?with_comments=true';
  }
  return HttpClient.fetchJson<ProjectVersion[]>(requestUrl);
}

export async function restore(channelId: string, versionId: string) {
  const url = rootUrl(channelId) + `/restore?version=${versionId}`;
  return HttpClient.put(url);
}
