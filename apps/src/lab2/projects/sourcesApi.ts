/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import HttpClient, {GetResponse} from '@cdo/apps/util/HttpClient';
import {
  isWeblab1CompatibilityModeEnabled,
  loadWeblab1ProjectAsLab2Sources,
  mainJsonIsLab2CodebridgeShape,
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

  // WebLab1 compat: inspect raw main.json first. Legacy/WebLab1/App-Lab-shaped
  // sources are not valid Codebridge MultiFileSource; avoid whack-a-mole ValidationError branches.
  if (isWeblab1CompatibilityModeEnabled()) {
    try {
      const {value: json, response} = await HttpClient.fetchJson<unknown>(
        url,
        {},
        undefined
      );
      if (mainJsonIsLab2CodebridgeShape(json)) {
        try {
          const value = SourceResponseValidator(
            json as Record<string, unknown>
          );
          return {value, response};
        } catch {
          return loadWeblab1ProjectAsLab2Sources(channelId, versionId);
        }
      }
      return loadWeblab1ProjectAsLab2Sources(channelId, versionId);
    } catch (error) {
      if (shouldFallbackToWeblab1Files(error)) {
        return loadWeblab1ProjectAsLab2Sources(channelId, versionId);
      }
      throw error;
    }
  }

  return HttpClient.fetchJson<ProjectSources>(url, {}, SourceResponseValidator);
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
